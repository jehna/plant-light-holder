/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />

declare module "*.wasm?url" {
  const url: string;
  export default url;
}

declare module "*?worker" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
