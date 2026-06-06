import Store from "electron-store";

const store = new Store({
  defaults: {
    theme: "frutiger",
    downloadFolder: "",
    audioFormat: "mp3",
    audioQuality: "320",
    videoFormat: "mp4",
    videoQuality: "1080"
  }
});

export default store;