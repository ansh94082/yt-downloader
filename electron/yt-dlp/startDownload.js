import { spawn } from "child_process";
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

  const args = [
    "--ffmpeg-location",
    ffmpegPath,
    "-o",
    `${downloadPath}/%(title)s.%(ext)s`,
    "--newline",
    url,
  ];

  if (type === "audio") {
    const audioQuality = quality === "highest" ? "0" : quality;
    args.splice(2, 0, "-x", "--audio-format", format, "--audio-quality", audioQuality);
  } else {
    const videoQuality = quality === "highest"
      ? "bv*+ba/b"
      : `bv*[height<=${quality.replace("p", "")}] + ba/b`;

    args.splice(2, 0, "-f", videoQuality, "--merge-output-format", format);
  }

  return new Promise((resolve, reject) => {
    const job = spawn(ytdlpPath, args);
    downloadManager.activeDownloads.set(item.id, job);

    job.on("spawn", () => {
      console.log("Process started");
    });

    job.stderr.on("data", (data) => {
      const text = data.toString();
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
        reject(new Error(`yt-dlp exited with ${code}`));
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
