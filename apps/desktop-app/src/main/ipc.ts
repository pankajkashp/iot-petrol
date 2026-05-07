import { BrowserWindow, ipcMain } from "electron";
import type { DeviceManager } from "./services/DeviceManager";

export function registerIpc(deviceManager: DeviceManager) {
  ipcMain.handle("desktop:get-overview", () => deviceManager.getOverview());
  ipcMain.handle("desktop:get-pumps", () => deviceManager.getOverview().pumps);
  ipcMain.handle("desktop:get-readings", () => deviceManager.getOverview().readings);
  ipcMain.handle("desktop:get-logs", () => deviceManager.getOverview().logs);

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
