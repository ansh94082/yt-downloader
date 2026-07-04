import path from 'node:path';
import { app } from 'electron';

export function getBinaryPaths() {
  const platform = process.platform;

  const basePath = app.isPackaged ? process.resourcesPath : path.join(process.cwd(), 'resources');

  return {
    ytdlp: path.join(
      basePath,
      platform,
      platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
    ),

    ffmpeg: path.join(
      basePath,
      platform,
      platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
    ),

    ffprobe: path.join(
      basePath,
      platform,
      platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'
    ),
  };
}