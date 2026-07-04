import Store from "electron-store";

const jobStore = new Store({
  defaults: {
    downloads: []
  }
});

export default jobStore;