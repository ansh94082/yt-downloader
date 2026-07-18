// Central queue manager that persists jobs, dispatches them, and keeps the UI synchronized.
import fs from "fs";
import path from "path";
import jobStore from "../jobStore.js";
import downloadQueue from "./queue.js";
import startDownload from "../yt-dlp/startDownload.js";

class DownloadManager {
  constructor() {
    this.queue = downloadQueue;
    this.isProcessing = false;
    this.activeDownloads = new Map();
    this.mainWindow = null;
  }

  attachWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  normalizeJobs(jobs = []) {
    return jobs.map((job) => {
      const normalized = {
        ...job,
        status: job.status || "queued",
        progress: job.progress ?? 0,
        createdAt: job.createdAt ?? Date.now(),
        startedAt: job.startedAt ?? null,
        finishedAt: job.finishedAt ?? null,
        speed: job.speed ?? null,
        eta: job.eta ?? null,
        error: job.error ?? null,
      };

      if (normalized.downloadPath && normalized.status === "finished") {
        const folderExists = fs.existsSync(path.resolve(normalized.downloadPath));
        if (!folderExists) {
          normalized.status = "missing";
          normalized.error = "Download not found.";
        }
      }

      return normalized;
    });
  }

  getJobs() {
    return this.normalizeJobs(jobStore.get("downloads") || []);
  }

  broadcastJobs() {
    if (this.mainWindow?.webContents) {
      this.mainWindow.webContents.send("downloads:updated", this.getJobs());
    }
  }

  refreshPersistedJobs() {
    const jobs = this.getJobs();
    jobStore.set("downloads", jobs);
    this.broadcastJobs();
    return jobs;
  }

  persistJob(item) {
    const jobs = this.getJobs();
    const existingIndex = jobs.findIndex((job) => job.id === item.id);
    const normalized = {
      ...item,
      status: item.status || "queued",
      progress: item.progress ?? 0,
      createdAt: item.createdAt ?? Date.now(),
      startedAt: item.startedAt ?? null,
      finishedAt: item.finishedAt ?? null,
      speed: item.speed ?? null,
      eta: item.eta ?? null,
      error: item.error ?? null,
    };

    if (existingIndex >= 0) {
      jobs[existingIndex] = { ...jobs[existingIndex], ...normalized };
    } else {
      jobs.push(normalized);
    }

    jobStore.set("downloads", jobs);
    this.broadcastJobs();
    return normalized;
  }

  updateJob(id, patch) {
    const jobs = this.getJobs();
    const index = jobs.findIndex((job) => job.id === id);

    if (index < 0) return null;

    const updated = { ...jobs[index], ...patch };
    jobs[index] = updated;
    jobStore.set("downloads", jobs);
    this.broadcastJobs();
    return updated;
  }

  enqueue(item) {
    const queuedItem = this.persistJob({ ...item, status: "queued", progress: 0 });
    this.queue.enqueue(queuedItem);
    this.process();
    return queuedItem;
  }

  async process() {
    if (this.isProcessing) return;
    if (this.queue.isEmpty()) return;

    this.isProcessing = true;
    const item = this.queue.dequeue();

    if (!item) {
      this.isProcessing = false;
      return;
    }

    this.updateJob(item.id, { status: "downloading", error: null, progress: 0 });

    try {
      await startDownload(item);
      this.updateJob(item.id, { status: "finished", progress: 100, finishedAt: Date.now() });
    } catch (err) {
      const current = this.getJobs().find((job) => job.id === item.id);
      const nextStatus = current?.status === "paused" || current?.status === "canceled"
        ? current.status
        : "failed";
      this.updateJob(item.id, { status: nextStatus, error: err?.message || "Download failed." });
    } finally {
      this.activeDownloads.delete(item.id);
      this.isProcessing = false;
      this.process();
    }
  }

  pauseDownload(id) {
    const child = this.activeDownloads.get(id);

    if (child) {
      child.kill("SIGSTOP");
    }

    this.updateJob(id, { status: "paused" });
    return true;
  }

  resumeDownload(id) {
    const child = this.activeDownloads.get(id);

    if (child) {
      child.kill("SIGCONT");
    }

    this.updateJob(id, { status: "downloading" });
    return true;
  }

  cancelDownload(id) {
    this.queue.remove(id);

    const child = this.activeDownloads.get(id);
    if (child) {
      child.kill("SIGTERM");
      this.activeDownloads.delete(id);
    }

    this.updateJob(id, { status: "canceled", error: "Canceled." });
    return true;
  }
}

export default new DownloadManager();