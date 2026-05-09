import { BrowserWindow, ipcMain } from "electron";
import type { DeviceManager } from "@fuel/device-core";

export function registerIpc(deviceManager: DeviceManager) {
  ipcMain.handle("desktop:get-overview", async () => deviceManager.getOverview());
  ipcMain.handle("desktop:get-pumps", async () => (await deviceManager.getOverview()).pumps);
  ipcMain.handle("desktop:get-readings", async () => (await deviceManager.getOverview()).readings);
  ipcMain.handle("desktop:get-logs", async () => (await deviceManager.getOverview()).logs);
  ipcMain.handle("desktop:toggle-sensor-feed", (_event, pumpId: string) =>
    deviceManager.toggleSensorFeed(pumpId)
  );

  deviceManager.on("event", (event) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("desktop:event", event);
    }
  });

  deviceManager.on("overview", (overview) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("desktop:overview", overview);
    }
  });
}
