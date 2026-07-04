import downloadQueue from "./queue.js";
import startDownload from "../yt-dlp/startDownload.js";

class DownloadManager {    // seperate class to manage the download queue
    constructor() {
        this.queue = downloadQueue;
        this.isProcessing = false;
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
        } finally {
            this.isProcessing = false;  // after processing either success or fail , set the status of queue to not-processing , and call back the process to start the next download .
            this.process();
        }
    }
}

export default new DownloadManager();