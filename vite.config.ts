import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "write-nojekyll",
      closeBundle() {
        writeFileSync(resolve("dist", ".nojekyll"), "");
      }
    }
  ],
  build: {
    sourcemap: true
  }
});
