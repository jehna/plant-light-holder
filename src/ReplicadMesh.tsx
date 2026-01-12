import { useRef, useLayoutEffect, useEffect, memo } from "react";
import { useThree } from "@react-three/fiber";
import { BufferGeometry } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
} from "replicad-threejs-helper";

interface FaceMesh {
  vertices: number[];
  triangles: number[];
  normals: number[];
}

interface EdgeMesh {
  lines: number[];
  edgeGroups?: { start: number; count: number; edgeId: number }[];
}

interface ShapeMeshesProps {
  faces?: FaceMesh;
  edges?: EdgeMesh;
}

export default memo(function ShapeMeshes({ faces, edges }: ShapeMeshesProps) {
  const { invalidate } = useThree();

  const body = useRef(new BufferGeometry());
  const lines = useRef(new BufferGeometry());

  useLayoutEffect(() => {
    if (faces) syncFaces(body.current, faces);

    if (edges) syncLines(lines.current, edges);
    else if (faces) syncLinesFromFaces(lines.current, body.current);

    invalidate();
  }, [faces, edges, invalidate]);

  useEffect(
    () => () => {
      body.current.dispose();
      lines.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <group>
      <mesh geometry={body.current}>
        <meshStandardMaterial
          color="#5a8296"
          polygonOffset
          polygonOffsetFactor={2.0}
          polygonOffsetUnits={1.0}
        />
      </mesh>
      <lineSegments geometry={lines.current}>
        <lineBasicMaterial color="#3c5a6e" />
      </lineSegments>
    </group>
  );
});
