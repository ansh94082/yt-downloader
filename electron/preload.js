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
    }

  }
);


console.log("PRELOAD LOADED");
