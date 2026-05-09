// electron.vite.config.ts
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
var electron_vite_config_default = defineConfig({
  main: {},
  preload: {},
  renderer: {
    server: {
      host: "127.0.0.1",
      port: 3e3,
      strictPort: true
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
