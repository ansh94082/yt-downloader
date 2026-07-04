import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import store from "./settingsStore.js";
import path from "path";
import fs from "fs";
import { softSearch } from './yt-dlp/softSearch.js';
import { log } from 'console';
import { getBinaryPaths } from './yt-dlp/binaries.js';
import { verifyBinaries } from './yt-dlp/verify.js';
import jobStore from './jobStore.js'
import downloadManager from "./utilities/downloadManager.js";


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
  win.loadURL('http://localhost:6767');
};
app.whenReady().then(async () => {
  try {
    await verifyBinaries();
    console.log('Binaries verified');
  } catch (err) {
    console.error('Binary verification failed:', err);
    app.quit();
    return;
  }

  console.log(getBinaryPaths());

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


const platformFiles = {
  win32: {
    ytdlp: "yt-dlp.exe",
    ffmpeg: "ffmpeg.exe",
    plocation: "../resources/win32"
  },
  linux: {
    ytdlp: "yt-dlp",
    ffmpeg: "ffmpeg",
    plocation: "../resources/linux"
  },
  darwin: {
    ytdlp: "yt-dlp_macos",
    ffmpeg: "ffmpeg",
    plocation: "../resources/darwin"
  },
};

console.log(process.platform);
console.log(process.platform);
console.log(process.platform);
console.log(process.platform);
console.log(process.platform);
console.log(process.platform);

store.platform = process.platform;

console.log("hello");

console.log(store.platform);

const files = platformFiles[process.platform];

if (!files) {
  throw new Error(`Unsupported platform: ${process.platform}`);
}







// All the ipc api definitions below

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

ipcMain.handle("settings:save", (_, settings) => {  // save settings on pressing save in settings
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


ipcMain.handle("folder:select", async () => {      // select custom downloads location

  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });

  console.log(result);

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});



ipcMain.handle("downloads:path", () => {     // find the default downloads location

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


ipcMain.handle("analyze:input", async (_, url) => { // handle searches by user in the input box
  console.log("MAIN RECEIVED:", url);
  try {
    const result = await softSearch(url);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
});

ipcMain.handle("store:get", async () => { // returns download folder

  const dat = await store.get("downloadFolder");
  console.log(dat)
  return dat


})

ipcMain.handle("job:Enter", (event , item) => { // update the status of failed jobs

  jobStore.set("downloads", [
    ...jobStore.get("downloads"),
    item
  ]);
  console.log(jobStore.get("downloads"));
  return true;




})

ipcMain.handle("download:start", async (event ,item) => {

  await downloadManager.enqueue(item);
  console.log(item , "inside main process");




})