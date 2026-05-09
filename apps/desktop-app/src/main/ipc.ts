import { BrowserWindow, ipcMain } from "electron";
import type { DeviceManager } from "@fuel/device-core";
import type { FuelPriceService } from "@fuel/billing-engine";
import type { FuelType } from "@fuel/shared-types";

export function registerIpc(deviceManager: DeviceManager, fuelPriceService: FuelPriceService) {
  ipcMain.handle("desktop:get-overview", async () => deviceManager.getOverview());
  ipcMain.handle("desktop:get-pumps", async () => (await deviceManager.getOverview()).pumps);
  ipcMain.handle("desktop:get-readings", async () => (await deviceManager.getOverview()).readings);
  ipcMain.handle("desktop:get-logs", async () => (await deviceManager.getOverview()).logs);
  ipcMain.handle("desktop:toggle-sensor-feed", (_event, pumpId: string) =>
    deviceManager.toggleSensorFeed(pumpId)
  );

  // Fuel Price IPC
  ipcMain.handle("desktop:get-fuel-prices", async (_event, city: string, refresh?: boolean) => 
    fuelPriceService.getPrices(city, refresh)
  );
  
  ipcMain.handle("desktop:get-fuel-history", async (_event, fuelType: FuelType, city: string, limit?: number) => 
    fuelPriceService.getPriceHistory(fuelType, city, limit)
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
