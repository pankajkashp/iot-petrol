import path from "node:path";
import { app, BrowserWindow } from "electron";
import { DeviceManager, MockDispenserProtocol } from "@fuel/device-core";
import { LocalDatabase } from "./services/LocalDatabase";
import { registerIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;
const database = new LocalDatabase();

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
  
  const pumps = await database.getPumps();
  const protocol = new MockDispenserProtocol(pumps.map(p => ({ 
    id: p.pumpId, 
    price: p.pricePerLiter 
  })));

  const deviceManager = new DeviceManager({
    database,
    protocol
  });

  // Re-broadcast overview on every update
  deviceManager.on("overview", (overview) => {
    mainWindow?.webContents.send("overview-update", overview);
  });

  registerIpc(deviceManager, database);
  createWindow();
  await deviceManager.start();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
