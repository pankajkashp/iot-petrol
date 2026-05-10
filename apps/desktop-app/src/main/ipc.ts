import { BrowserWindow, ipcMain } from "electron";
import type { DeviceManager } from "@fuel/device-core";
import type { FuelType } from "@fuel/shared-types";

export function registerIpc(deviceManager: DeviceManager, database: any) {
  ipcMain.handle("desktop:get-overview", async () => deviceManager.getOverview());
  ipcMain.handle("desktop:get-pumps", async () => (await deviceManager.getOverview()).pumps);
  ipcMain.handle("desktop:get-logs", async () => (await database.getLogs()));
  
  ipcMain.handle("desktop:toggle-sensor-feed", (_event, pumpId: string) => {
    // Note: In the new transactional architecture, manual toggling might be handled differently
    // but we keep the IPC mapping for UI compatibility with the simulator
    console.log(`[IPC] Toggle sensor feed for ${pumpId}`);
  });

  // Fuel Price IPC (Using database directly as a simple provider)
  ipcMain.handle("desktop:get-fuel-prices", async (_event, city: string) => 
    database.getPrices(city)
  );
  
  ipcMain.handle("desktop:get-fuel-history", async (_event, fuelType: FuelType, city: string, limit?: number) => 
    database.getPriceHistory(fuelType, city, limit)
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
