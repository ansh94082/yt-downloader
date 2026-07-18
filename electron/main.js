// Electron entry point that wires the IPC bridges, download manager, and window lifecycle.
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
/* global process */
import store from "./settingsStore.js";
import { softSearch } from "./yt-dlp/softSearch.js";
import { getBinaryPaths } from "./yt-dlp/binaries.js";
import { verifyBinaries } from "./yt-dlp/verify.js";
import downloadManager from "./utilities/downloadManager.js";

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



let mainWindow;

const isDev = !app.isPackaged;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 650,
    show: false,
    title: app.getName(),
    backgroundColor: "#e2cba9",
    icon: app.isPackaged
      ? path.join(process.resourcesPath, "resources", process.platform, "icon.png")
      : path.join(process.cwd(), "build", "icon.png"),
       webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  downloadManager.attachWindow(mainWindow);
  downloadManager.refreshPersistedJobs();

  if (isDev) {
    mainWindow.loadURL("http://localhost:6767");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
};

app.whenReady().then(async () => {
  try {
    await verifyBinaries();
  } catch (err) {
    console.error("Binary verification failed:", err);
    app.quit();
    return;
  }

  if (isDev) {
    console.log(getBinaryPaths());
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


ipcMain.handle("settings:get", async () => {
  if (!store.get("downloadFolder")) {
    const defaultPath = path.join(app.getPath("downloads"), "YT Downloader");
    store.set("downloadFolder", defaultPath);
  }

  return store.store;
});

ipcMain.handle("settings:save", (_, settings) => {
  store.store = settings;
  return true;
});

ipcMain.handle("folder:select", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("downloads:path", () => {
  const configuredPath = store.get("downloadFolder");
  const fallbackPath = path.join(app.getPath("downloads"), "YT Downloader");
  const downloadPath = configuredPath || fallbackPath;
  const resolvedPath = path.isAbsolute(downloadPath) ? downloadPath : path.resolve(downloadPath);

  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
  }

  return resolvedPath;
});

ipcMain.handle("analyze:input", async (_, url) => {
  try {
    return await softSearch(url);
  } catch (err) {
    console.error(err);
    throw err;
  }
});

ipcMain.handle("store:get", async () => store.get("downloadFolder"));

ipcMain.handle("job:Enter", (_, item) => {
  downloadManager.persistJob(item);
  return true;
});

ipcMain.handle("download:jobAdded", async (_, item) => {
  downloadManager.enqueue(item);
  mainWindow?.webContents.send("download:started", item);
  return true;
});

ipcMain.handle("jobs:get", async () => downloadManager.getJobs());
ipcMain.handle("download:pause", (_, id) => downloadManager.pauseDownload(id));
ipcMain.handle("download:resume", (_, id) => downloadManager.resumeDownload(id));
ipcMain.handle("download:cancel", (_, id) => downloadManager.cancelDownload(id));

ipcMain.handle("download:retry", async (_, id, stats) => {
  const current = downloadManager.getJobs().find((job) => job.id === id);
  if (!current) return false;

  const retried = downloadManager.persistJob({
    ...current,
    ...stats,
    status: "queued",
    progress: 0,
    error: null,
    startedAt: null,
    finishedAt: null,
    createdAt: Date.now(),
  });

  downloadManager.enqueue(retried);
  return true;
});

ipcMain.handle("folder:open", async (_, jobId, folderPath) => {
  const fallbackPath = store.get("downloadFolder") || path.join(app.getPath("downloads"), "YT Downloader");
  const rawPath = folderPath || fallbackPath;
  const normalizedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath);

  let targetPath = normalizedPath;

  if (fs.existsSync(normalizedPath)) {
    const stats = fs.statSync(normalizedPath);
    if (!stats.isDirectory()) {
      targetPath = path.dirname(normalizedPath);
    }
  }

  try {
    fs.mkdirSync(targetPath, { recursive: true });
    await shell.openPath(targetPath);
    return { ok: true, missing: false, path: targetPath };
  } catch (error) {
    console.error("Folder open failed:", error);
    downloadManager.updateJob(jobId, {
      status: "missing",
      error: "Could not open the download folder.",
    });
    return { ok: false, missing: true, path: targetPath };
  }
});
