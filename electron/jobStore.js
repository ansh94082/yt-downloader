// Persistent Electron store for download metadata and queue state.
import Store from "electron-store";

const jobStore = new Store({
  defaults: {
    downloads: []
  }
});

export default jobStore;