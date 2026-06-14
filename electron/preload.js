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
      ipcRenderer.invoke("downloads:path")


  }
);

console.log("PRELOAD LOADED");