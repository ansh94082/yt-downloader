const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getSettings: () => ipcRenderer.invoke("settings:get"),

  saveSettings: (settings) =>
    ipcRenderer.invoke("settings:save", settings),

  selectFolder: () =>
    ipcRenderer.invoke("folder:select"),

  getDefaultDownloadPath: () =>
    ipcRenderer.invoke("downloads:path"),

  analyzeVideo: (url) =>
    ipcRenderer.invoke("analyze:input", url),

  getStore: () =>
    ipcRenderer.invoke("store:get"),

  handleEnter: (item) =>
    ipcRenderer.invoke("job:Enter", item),

  startDownload: (item) =>
    ipcRenderer.invoke("download:jobAdded", item),

  onDownloadStarted: (callback) => {
    const listener = (_, item) => callback(item);
    ipcRenderer.on("download:started", listener);
    return () => ipcRenderer.removeListener("download:started", listener);
  },

  getJobs: () =>
    ipcRenderer.invoke("jobs:get"),

  onJobsChanged: (callback) => {
    const listener = (_, jobs) => callback(jobs);
    ipcRenderer.on("downloads:updated", listener);
    return () => ipcRenderer.removeListener("downloads:updated", listener);
  },

  pauseDownload: (id) =>
    ipcRenderer.invoke("download:pause", id),

  resumeDownload: (id) =>
    ipcRenderer.invoke("download:resume", id),

  cancelDownload: (id) =>
    ipcRenderer.invoke("download:cancel", id),

  openFolder: (jobId, folderPath) =>
    ipcRenderer.invoke("folder:open", jobId, folderPath),

  retryDownload: (id, stats) =>
    ipcRenderer.invoke("download:retry", id, stats),
});

console.log("PRELOAD LOADED");