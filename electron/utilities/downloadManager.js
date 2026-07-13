import downloadQueue from "./queue.js";
import startDownload from "../yt-dlp/startDownload.js";

class DownloadManager {    // seperate class to manage the download queue
    constructor() {
        this.queue = downloadQueue;
        this.isProcessing = false;
        this.activeDownloads = new Map();
    }
    async enqueue(item) {
        downloadQueue.enqueue(item);
        this.process();
    }

    async process() {
        if (this.isProcessing) return;
        if (this.queue.isEmpty()) return;

        this.isProcessing = true;

        const item = this.queue.dequeue();

        try {
            await startDownload(item);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            this.isProcessing = false;
            this.process();
        }
    }
}

export default new DownloadManager();