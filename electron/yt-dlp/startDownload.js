// Launches the yt-dlp process for either video or audio downloads and reports progress back to the renderer.
import { spawn } from "child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import downloadManager from "../utilities/downloadManager.js";
import { getBinaryPaths } from "./binaries.js";
import { verifyBinaries } from "./verify.js";

function parseProgressPatch(text) {
  const patch = {};
  const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);

  if (percentMatch) {
    patch.progress = Math.max(0, Math.min(100, Number(percentMatch[1])));
  }

  const speedMatch = text.match(/at\s+([\d.]+)\s*([KMG]?i?B?)\/s/i);
  if (speedMatch) {
    const value = Number(speedMatch[1]);
    const unit = speedMatch[2]?.toLowerCase() || "b";
    const multipliers = {
      b: 1,
      kb: 1024,
      kib: 1024,
      mb: 1024 * 1024,
      mib: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
      gib: 1024 * 1024 * 1024,
    };

    patch.speed = value * (multipliers[unit] || 1);
  }

  const etaMatch = text.match(/eta\s+(\d{1,2})(?::(\d{2}))?/i);
  if (etaMatch) {
    const minutes = Number(etaMatch[1]);
    const seconds = Number(etaMatch[2] || 0);
    patch.eta = minutes * 60 + seconds;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

function getAudioQuality(quality) {
  const value = String(quality || "highest").trim().toLowerCase();

  if (value === "highest") return "0";

  const bitrate = value.match(/\d+/)?.[0];
  return bitrate ? `${bitrate}K` : "0";
}

const startDownload = async (item) => {
  try {
    await verifyBinaries();
  } catch (err) {
    downloadManager.updateJob(item.id, { status: "failed", error: err?.message || "Binaries unavailable." });
    throw err;
  }

  const bPath = getBinaryPaths();
  const ytdlpPath = bPath.ytdlp;
  const ffmpegPath = bPath.ffmpeg;
  const { id, quality, format, downloadPath, type } = item;
  const url = `https://www.youtube.com/watch?v=${id}`;
  const resolvedDownloadPath = path.resolve(downloadPath);
  fs.mkdirSync(resolvedDownloadPath, { recursive: true });
  const outputPath = path.join(resolvedDownloadPath, "%(title)s.%(ext)s");

  const args = [
    "--ffmpeg-location",
    ffmpegPath,
    "-o",
    outputPath,
    "--newline",
    "--no-playlist",
    ...(process.platform === "win32" ? ["--windows-filenames"] : []),
    url,
  ];

  if (type === "audio") {
    args.splice(2, 0, "-x", "--audio-format", String(format || "mp3").toLowerCase(), "--audio-quality", getAudioQuality(quality));
  } else {
    const videoQuality = quality === "highest"
      ? "bv*+ba/b"
      : `bv*[height<=${String(quality).replace(/[^\d]/g, "")}]+ba/b`;

    args.splice(2, 0, "-f", videoQuality, "--merge-output-format", String(format || "mp4").toLowerCase());
  }

  return new Promise((resolve, reject) => {
    const job = spawn(ytdlpPath, args, { windowsHide: true });
    downloadManager.activeDownloads.set(item.id, job);
    let stderr = "";

    job.on("spawn", () => {
      console.log("Process started");
    });

    job.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      const patch = parseProgressPatch(text);
      if (patch) {
        downloadManager.updateJob(item.id, patch);
      }
      console.error(text);
    });

    job.on("close", (code) => {
      console.log("Exit code:", code);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `yt-dlp exited with ${code}`));
      }
    });

    job.on("error", reject);
    job.stdout.on("data", (data) => {
      const text = data.toString();
      const patch = parseProgressPatch(text);
      if (patch) {
        downloadManager.updateJob(item.id, patch);
      }
      console.log(text);
    });
  });
};

export default startDownload;
