import { useState, useEffect, useCallback, useRef } from "react";

import ThreeContext from "./ThreeContext";
import ReplicadMesh from "./ReplicadMesh";
import { cad } from "./workerInstance";
import { defaultParams, ModelParams } from "./plant-light-holder";

function DownloadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function App() {
  const [mesh, setMesh] = useState<{
    faces: { vertices: number[]; triangles: number[]; normals: number[] };
    edges: {
      lines: number[];
      edgeGroups?: { start: number; count: number; edgeId: number }[];
    };
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [params, setParams] = useState<ModelParams>(defaultParams);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchMesh = useCallback((p: ModelParams = paramsRef.current) => {
    cad.createMesh(p).then((m) => setMesh(m));
  }, []);

  const handleParamChange = useCallback(
    (key: keyof ModelParams, value: number) => {
      const newParams = { ...paramsRef.current, [key]: value };
      setParams(newParams);
      fetchMesh(newParams);
    },
    [fetchMesh]
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await cad.createBlob(paramsRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plant-light-holder.stl";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, []);

  useEffect(() => {
    fetchMesh();
  }, [fetchMesh]);

  // Re-fetch mesh when worker module updates via HMR
  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.on("worker-update", fetchMesh);
      return () => {
        import.meta.hot?.off("worker-update", fetchMesh);
      };
    }
  }, [fetchMesh]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px",
    border: "1px solid #555",
    borderRadius: "4px",
    backgroundColor: "#333",
    color: "white",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "4px",
    fontSize: "12px",
    color: "#aaa",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  return (
    <main style={{ margin: 0, padding: 0, height: "100vh", width: "100vw" }}>
      {mesh ? (
        <>
          <ThreeContext>
            <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
          </ThreeContext>
          <div
            style={{
              position: "fixed",
              top: 24,
              left: 24,
              backgroundColor: "rgba(40, 40, 40, 0.95)",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minWidth: "180px",
            }}
          >
            <div>
              <label style={labelStyle}>Neck Length (mm)</label>
              <input
                type="number"
                value={params.neckLength}
                onChange={(e) =>
                  handleParamChange(
                    "neckLength",
                    parseFloat(e.target.value) || 0
                  )
                }
                step="5"
                min="50"
                max="300"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Neck Thickness (mm)</label>
              <input
                type="number"
                value={params.neckThickness}
                onChange={(e) =>
                  handleParamChange(
                    "neckThickness",
                    parseFloat(e.target.value) || 0
                  )
                }
                step="0.5"
                min="2"
                max="20"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Base Width (mm)</label>
              <input
                type="number"
                value={params.baseWidth}
                onChange={(e) =>
                  handleParamChange(
                    "baseWidth",
                    parseFloat(e.target.value) || 0
                  )
                }
                step="1"
                min="20"
                max="100"
                style={inputStyle}
              />
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              padding: 0,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#5a8296",
              cursor: downloading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              opacity: downloading ? 0.7 : 1,
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!downloading) e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Download STL"
          >
            <DownloadIcon />
          </button>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontSize: "2em",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Loading...
        </div>
      )}
    </main>
  );
}
