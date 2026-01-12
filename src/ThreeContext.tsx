import { Suspense, ReactNode, useRef, useEffect } from "react";
import { Canvas, CanvasProps, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

// Store camera state for HMR persistence
const cameraState = import.meta.hot?.data.cameraState ?? {
  position: null as THREE.Vector3 | null,
  target: null as THREE.Vector3 | null,
  zoom: null as number | null,
};
if (import.meta.hot) {
  import.meta.hot.data.cameraState = cameraState;
}

function PersistentOrbitControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate } = useThree();

  // Restore camera state on mount
  useEffect(() => {
    if (controlsRef.current && cameraState.position) {
      camera.position.copy(cameraState.position);
      controlsRef.current.target.copy(cameraState.target!);
      if (camera instanceof THREE.OrthographicCamera && cameraState.zoom) {
        camera.zoom = cameraState.zoom;
        camera.updateProjectionMatrix();
      }
      controlsRef.current.update();
      invalidate();
    }
  }, [camera, invalidate]);

  // Save camera state on unmount
  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        cameraState.position = camera.position.clone();
        cameraState.target = controlsRef.current.target.clone();
        if (camera instanceof THREE.OrthographicCamera) {
          cameraState.zoom = camera.zoom;
        }
      }
    };
  }, [camera]);

  return <OrbitControls ref={controlsRef} target={[0, 50, 120]} />;
}

interface ThreeContextProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
}

export default function ThreeContext({
  children,
  ...props
}: ThreeContextProps) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  return (
    <Suspense fallback={null}>
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
        dpr={dpr}
        frameloop="demand"
        orthographic
        camera={{ position: [30, 100, 160], near: 0.1, far: 1000, zoom: 1.3 }}
        {...props}
      >
        <PersistentOrbitControls />
        <Grid
          args={[200, 200]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#a0a0a0"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#707070"
          fadeDistance={500}
          infiniteGrid
          rotation={[Math.PI / 2, 0, 0]}
        />
        <ambientLight intensity={4} />
        <pointLight position={[100, 100, 100]} />
        {children}
      </Canvas>
    </Suspense>
  );
}
