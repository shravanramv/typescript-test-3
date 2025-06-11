import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    exclude: ["duckdb"],
  },
  plugins: [react(), tempo()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["mock-aws-s3", "aws-sdk", "nock"],
      output: {
        globals: {
          "mock-aws-s3": "mockAws",
          "aws-sdk": "AWS",
          nock: "nock",
        },
      },
    },
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  },
});
