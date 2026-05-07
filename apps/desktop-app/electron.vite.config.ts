import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    server: {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true
    },
    plugins: [react()]
  }
});
