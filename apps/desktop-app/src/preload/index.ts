import { contextBridge, ipcRenderer } from "electron";
import type { LocalDatabase } from "../main/services/LocalDatabase";

type Overview = ReturnType<LocalDatabase["getOverview"]>;

contextBridge.exposeInMainWorld("desktopApi", {
  getOverview: () => ipcRenderer.invoke("desktop:get-overview") as Promise<Overview>,
  getPumps: () => ipcRenderer.invoke("desktop:get-pumps") as Promise<Overview["pumps"]>,
  getReadings: () =>
    ipcRenderer.invoke("desktop:get-readings") as Promise<Overview["readings"]>,
  getLogs: () => ipcRenderer.invoke("desktop:get-logs") as Promise<Overview["logs"]>,
  onReading: (callback: (payload: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => {
      callback(payload);
    };

    ipcRenderer.on("desktop:reading", handler);

    return () => {
      ipcRenderer.removeListener("desktop:reading", handler);
    };
  }
});
