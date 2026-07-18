// Renderer-side bridge that exposes the Electron IPC API to the React UI.
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
  "api",
  {
    getSettings: () => ipcRenderer.invoke("settings:get"),

    saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),

    selectFolder: () => ipcRenderer.invoke("folder:select"),

    getDefaultDownloadPath: () => ipcRenderer.invoke("downloads:path"),

    analyzeVideo: async (url) => {
      console.log("PRELOAD:", url);
      return ipcRenderer.invoke("analyze:input", url);
    },

    getStore: async () => ipcRenderer.invoke("store:get"),

    handleEnter: async (item) => ipcRenderer.invoke("job:Enter", item),

    startDownload: async (item) => ipcRenderer.invoke("download:jobAdded", item),

    onDownloadStarted: (callback) => {
      const listener = (_, item) => callback(item);
      ipcRenderer.on("download:started", listener);

      return () => {
        ipcRenderer.removeListener("download:started", listener);
      };
    },

    getJobs: async () => ipcRenderer.invoke("jobs:get"),

    onJobsChanged: (callback) => {
      const listener = (_, jobs) => callback(jobs);
      ipcRenderer.on("downloads:updated", listener);

      return () => {
        ipcRenderer.removeListener("downloads:updated", listener);
      };
    },

    pauseDownload: async (id) => ipcRenderer.invoke("download:pause", id),

    resumeDownload: async (id) => ipcRenderer.invoke("download:resume", id),

    cancelDownload: async (id) => ipcRenderer.invoke("download:cancel", id),

    openFolder: async (jobId, folderPath) => ipcRenderer.invoke("folder:open", jobId, folderPath),

    retryDownload: async (id, stats) => ipcRenderer.invoke("download:retry", id, stats),
  }
);

console.log("PRELOAD LOADED");
