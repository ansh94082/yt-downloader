import { app, BrowserWindow , dialog , ipcMain} from 'electron';
import store from "./settingsStore.js";
import path from "path";



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

ipcMain.handle("settings:get", () => {
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

ipcMain.handle("folder:select", () => {

  

  const result = dialog.showOpenDialog({properties: ["openDirectory"]});

  
  if(result.canceled){
    return null;
  }
  return result.filepaths[0];
    



});