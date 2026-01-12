import { wrap } from "comlink";
import cadWorker from "./worker?worker";
import { ModelParams } from "./plant-light-holder";

interface WorkerAPI {
  createBlob: (params?: ModelParams) => Promise<Blob>;
  createMesh: (params?: ModelParams) => Promise<{
    faces: { vertices: number[]; triangles: number[]; normals: number[] };
    edges: {
      lines: number[];
      edgeGroups?: { start: number; count: number; edgeId: number }[];
    };
  }>;
}

// Persist the worker across hot module reloads
let cad: ReturnType<typeof wrap<WorkerAPI>>;

function createWorker() {
  return wrap<WorkerAPI>(new cadWorker());
}

if (import.meta.hot) {
  // Check if worker factory changed (indicates worker code updated)
  const prevFactory = import.meta.hot.data.workerFactory;
  const existingWorker = import.meta.hot.data.cad;

  if (existingWorker && prevFactory === cadWorker) {
    // Worker code unchanged, reuse existing worker
    cad = existingWorker;
  } else {
    // Worker code changed or first load, create new worker
    cad = createWorker();
    if (prevFactory) {
      // This is an HMR update, notify listeners
      window.dispatchEvent(new CustomEvent("worker-updated"));
    }
  }

  // Store for next HMR update
  import.meta.hot.data.cad = cad;
  import.meta.hot.data.workerFactory = cadWorker;

  // Accept self-updates to handle worker dependency changes
  import.meta.hot.accept();
} else {
  // Production: just create the worker
  cad = createWorker();
}

export { cad, type WorkerAPI };
