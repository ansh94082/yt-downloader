import { app, BrowserWindow , dialog , ipcMain} from 'electron';
import store from "./settingsStore.js";
import path from "path";
import fs from "fs";


const createWindow = () => {
  const win = new BrowserWindow({
  width: 800,
  height: 600,
  title: "YT Downloader",
  backgroundColor: "#e2cba9",

  webPreferences: {
    preload: path.join(
      app.getAppPath(),
      "electron",
      "preload.js"
    ),
    contextIsolation: true,
    nodeIntegration: true
  }
});
  win.loadURL('http://localhost:3000');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log(store.path);


ipcMain.handle("settings:get", async () => {    // provides settings from electron store , the only discrepancy is in the case of download path which can be checked for

  if (!store.get("downloadFolder")) {

    const defaultPath = path.join(
      app.getPath("downloads"),
      "YT Downloader"
    );

    store.set(
      "downloadFolder",
      defaultPath
    );
  }

  return store.store;
});

console.log(store.path);

ipcMain.handle("settings:save", (_, settings) => {
  console.log("MAIN RECEIVED:", settings);

  store.store = settings;

  return true;
});
console.log(store.path);

console.log(
  path.join(
    app.getAppPath(),
    "electron",
    "preload.js"
  )
);


ipcMain.handle("folder:select", async () => {

  const result = await dialog.showOpenDialog({ properties: ["openDirectory"]});

  console.log(result);

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});



ipcMain.handle("downloads:path", () => {

  const downloadPath = path.join(
    app.getPath("downloads"),
    "YT Downloader"
  );

  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, {
      recursive: true
    });
  }

  return downloadPath;
});