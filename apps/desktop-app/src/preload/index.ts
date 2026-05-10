import { contextBridge, ipcRenderer } from "electron";
import type { DeviceEvent, DeviceOverview, FuelPrice, FuelType } from "@fuel/device-core";

contextBridge.exposeInMainWorld("desktopApi", {
  getOverview: () => ipcRenderer.invoke("desktop:get-overview") as Promise<DeviceOverview>,
  getPumps: () => ipcRenderer.invoke("desktop:get-pumps") as Promise<DeviceOverview["pumps"]>,
  getLogs: () => ipcRenderer.invoke("desktop:get-logs") as Promise<DeviceOverview["logs"]>,
  toggleSensorFeed: (pumpId: string) => ipcRenderer.invoke("desktop:toggle-sensor-feed", pumpId),
  
  // Fuel Price
  getFuelPrices: (city: string, refresh?: boolean) => 
    ipcRenderer.invoke("desktop:get-fuel-prices", city, refresh) as Promise<FuelPrice[]>,
  getFuelHistory: (fuelType: FuelType, city: string, limit?: number) => 
    ipcRenderer.invoke("desktop:get-fuel-history", fuelType, city, limit) as Promise<FuelPrice[]>,

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
