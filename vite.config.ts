import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/plant-light-holder/",
  build: {
    outDir: "build",
  },
  server: {
    port: 4444,
  },
});
