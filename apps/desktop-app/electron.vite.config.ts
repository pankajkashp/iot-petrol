import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    server: {
      host: "127.0.0.1",
      port: 3000,
      strictPort: true
    },
    plugins: [react()]
  }
});
