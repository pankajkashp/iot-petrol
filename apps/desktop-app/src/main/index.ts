import path from "node:path";
import { app, BrowserWindow } from "electron";
import { LocalDatabase } from "./services/LocalDatabase";
import { DeviceManager } from "./services/DeviceManager";
import { registerIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;

const database = new LocalDatabase();
const deviceManager = new DeviceManager(database);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 780,
    backgroundColor: "#050b14",
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
  registerIpc(deviceManager);
  await deviceManager.start();
  createWindow();
});

app.on("window-all-closed", () => {
  deviceManager.stop();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
