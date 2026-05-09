import path from "node:path";
import { app, BrowserWindow } from "electron";
import { DeviceManager } from "@fuel/device-core";
import { FuelPriceService, MockFuelPriceProvider } from "@fuel/billing-engine";
import { LocalDatabase } from "./services/LocalDatabase";
import { createDeviceMap } from "./services/deviceFactory";
import { registerIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;

const database = new LocalDatabase();
let deviceManager: DeviceManager | null = null;
let fuelPriceService: FuelPriceService | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 780,
    title: "PumpCore",
    backgroundColor: "#F8FAFC",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  database.initialize();
  
  const deviceMap = createDeviceMap(await database.getPumps());
  deviceManager = new DeviceManager({
    repository: database,
    devices: deviceMap
  });

  fuelPriceService = new FuelPriceService(
    new MockFuelPriceProvider(),
    database
  );

  registerIpc(deviceManager, fuelPriceService);
  createWindow();
  await deviceManager.start();
});

app.on("window-all-closed", () => {
  void deviceManager?.stop();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
