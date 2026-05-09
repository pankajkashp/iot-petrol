import { contextBridge, ipcRenderer } from "electron";
import type { DeviceEvent, DeviceOverview } from "@fuel/device-core";
import type { LocalDatabase } from "../main/services/LocalDatabase";

type Overview = Awaited<ReturnType<LocalDatabase["getOverview"]>>;

contextBridge.exposeInMainWorld("desktopApi", {
  getOverview: () => ipcRenderer.invoke("desktop:get-overview") as Promise<Overview>,
  getPumps: () => ipcRenderer.invoke("desktop:get-pumps") as Promise<DeviceOverview["pumps"]>,
  getReadings: () =>
    ipcRenderer.invoke("desktop:get-readings") as Promise<DeviceOverview["readings"]>,
  getLogs: () => ipcRenderer.invoke("desktop:get-logs") as Promise<DeviceOverview["logs"]>,
  toggleSensorFeed: (pumpId: string) => ipcRenderer.invoke("desktop:toggle-sensor-feed", pumpId),
  onEvent: (callback: (event: DeviceEvent) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: DeviceEvent) => {
      callback(payload);
    };

    ipcRenderer.on("desktop:event", handler);

    return () => {
      ipcRenderer.removeListener("desktop:event", handler);
    };
  }
});
