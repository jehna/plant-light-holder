import { useState, useEffect, useCallback } from "react";

import ThreeContext from "./ThreeContext";
import ReplicadMesh from "./ReplicadMesh";
import { cad } from "./workerInstance";

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

  const fetchMesh = useCallback(() => {
    cad.createMesh().then((m) => setMesh(m));
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await cad.createBlob();
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

  return (
    <main style={{ margin: 0, padding: 0, height: "100vh", width: "100vw" }}>
      {mesh ? (
        <>
          <ThreeContext>
            <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
          </ThreeContext>
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
          }}
        >
          Loading...
        </div>
      )}
    </main>
  );
}
