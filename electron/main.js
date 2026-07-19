// Electron entry point that wires the IPC bridges, download manager, and window lifecycle.
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
/* global process */
import store from "./settingsStore.js";
import path from "path";
import fs from "fs";
import { softSearch } from "./yt-dlp/softSearch.js";
import { getBinaryPaths } from "./yt-dlp/binaries.js";
import { verifyBinaries } from "./yt-dlp/verify.js";
import downloadManager from "./utilities/downloadManager.js";

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "YT Downloader",
    backgroundColor: "#e2cba9",
    webPreferences: {
      preload: path.join(app.getAppPath(), "electron", "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  downloadManager.attachWindow(mainWindow);
  downloadManager.refreshPersistedJobs();
  mainWindow.loadURL("http://localhost:6767");
};

app.whenReady().then(async () => {
  try {
    await verifyBinaries();
    console.log("Binaries verified");
  } catch (err) {
    console.error("Binary verification failed:", err);
    app.quit();
    return;
  }

  console.log(getBinaryPaths());
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

const platformFiles = {
  win32: {
    ytdlp: "yt-dlp.exe",
    ffmpeg: "ffmpeg.exe",
    plocation: "../resources/win32",
  },
  linux: {
    ytdlp: "yt-dlp",
    ffmpeg: "ffmpeg",
    plocation: "../resources/linux",
  },
  darwin: {
    ytdlp: "yt-dlp_macos",
    ffmpeg: "ffmpeg",
    plocation: "../resources/darwin",
  },
};

store.platform = process.platform;

const files = platformFiles[process.platform];

if (!files) {
  throw new Error(`Unsupported platform: ${process.platform}`);
}

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
  try {

    if (!fs.existsSync(folderPath)) {
      console.log("error")
      return {
        ok: false,
        missing: true,
        path: folderPath,
      };
    }

    const error = await shell.openPath(folderPath);

    if (error) {
      console.error("Failed to open folder:", error);

      downloadManager.updateJob(jobId, {
        status: "missing",
        error: "Could not open the download folder.",
      });

      return {
        ok: false,
        missing: true,
        path: folderPath,
        error,
      };
    }

    return {
      ok: true,
      missing: false,
      path: folderPath,
    };
  } catch (err) {
    console.error(err);

    downloadManager.updateJob(jobId, {
      status: "missing",
      error: "Could not open the download folder.",
    });

    return {
      ok: false,
      missing: true,
      path: folderPath,
      error: err.message,
    };
  }
});