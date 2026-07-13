import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
  "api",
  {
    getSettings: () =>
      ipcRenderer.invoke("settings:get"),

    saveSettings: (settings) =>
      ipcRenderer.invoke(
        "settings:save",
        settings
      ),

    selectFolder: () =>
      ipcRenderer.invoke("folder:select"),

    getDefaultDownloadPath: () =>
      ipcRenderer.invoke("downloads:path"),

    analyzeVideo: async (url) => {
      console.log("PRELOAD:", url);
      return ipcRenderer.invoke("analyze:input", url);
    },

    getStore: async () => {
      return ipcRenderer.invoke("store:get");
    },

    handleEnter: async (item) => {
      return ipcRenderer.invoke("job:Enter", item)
    },
    startDownload: async (item) => {
      return ipcRenderer.invoke("download:jobAdded", item);
    },
    onDownloadStarted: (callback) => {
      const listener = (_, item) => callback(item);

      ipcRenderer.on("download:started", listener);

      return () => {
        ipcRenderer.removeListener("download:started", listener);
      };
    },

    getJobs: async () => {

      return ipcRenderer.invoke("jobs:get");

    },
    pauseDownload : async (id) => {
      return ipcRenderer.invoke("download:pause" ,id);
    } 

  }
);


console.log("PRELOAD LOADED");
