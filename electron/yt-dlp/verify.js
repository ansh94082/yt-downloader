import { spawn } from 'node:child_process';
import { getBinaryPaths } from './binaries.js';

let binariesHealthy = false;

function verifyCommand(binaryPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args);

    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr));
      }
    });
  });
}
export async function verifyBinaries() {
  console.log("verifyBinaries called");

  const { ytdlp, ffmpeg, ffprobe } = getBinaryPaths();

  console.log({
    ytdlp,
    ffmpeg,
    ffprobe,
  });

  try {
    await Promise.all([
      verifyCommand(ytdlp, ['--version']),
      verifyCommand(ffmpeg, ['-version']),
      verifyCommand(ffprobe, ['-version']),
    ]);

    binariesHealthy = true;
    console.log("All binaries healthy");
  } catch (err) {
    binariesHealthy = false;
    console.error("Binary verification failed:", err);
    throw err;
  }
}

export function areBinariesHealthy() {
  return binariesHealthy;
}