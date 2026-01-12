import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "replicad-opencascadejs/src/replicad_single.wasm?url";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (import.meta.hot) {
  import.meta.hot.accept();
}
