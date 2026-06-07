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
      ipcRenderer.invoke("folder:select")

  }
);

console.log("PRELOAD LOADED");