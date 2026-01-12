import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { OpenCascadeInstance } from "replicad-opencascadejs";
import { setOC } from "replicad";
import { expose } from "comlink";

import { main, ModelParams } from "./plant-light-holder";

let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  const OC = await (
    opencascade as (options: {
      locateFile: () => string;
    }) => Promise<OpenCascadeInstance>
  )({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  setOC(OC);

  return true;
};
const started = init();

async function createBlob(params?: ModelParams) {
  await started;
  return main(params).blobSTL();
}

async function createMesh(params?: ModelParams) {
  await started;
  const model = main(params);
  return {
    faces: model.mesh(),
    edges: model.meshEdges(),
  };
}

expose({ createBlob, createMesh });
