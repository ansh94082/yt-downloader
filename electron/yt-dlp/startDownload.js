import { spawn } from "child_process";
import downloadManager from "../utilities/downloadManager.js";
import { getBinaryPaths } from "./binaries.js";
import { verifyBinaries } from "./verify.js";

const preChecks = async () => {
    try {
        await verifyBinaries();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}


const startDownload = async (item) => {

    const ok = await preChecks();

    if (!ok) { // take the failed job and send to main process to store in the jobStore

        item.status = "failed"
        const sendFail = async () => {
            await window.api.handleEnter(item);

        }


    } else {
        item.status = "downloading"
        const sendStat = async () => {
            await window.api.handleEnter(item); console.log("entry committed")
        }


        if (item.type == "video") {

            const bPath = getBinaryPaths();
            const ytdlpPath = bPath.ytdlp;
            const ffmpegPath = bPath.ffmpeg;

            const {
                id,
                quality,
                format,
                downloadPath,

            } = item;

            const url = `https://www.youtube.com/watch?v=${id}`;

            console.log("-----------------------------------------------------------------");
            console.log(item);
            console.log("URL:", item.url);
            console.log("-----------------------------------------------------------------");


            console.log("yt-dlp:", ytdlpPath);
            console.log("ffmpeg:", ffmpegPath);
            console.log("Download path:", downloadPath);

            console.log(downloadPath);
            return new Promise((resolve, reject) => {
                const job = spawn(ytdlpPath, [
                    "--ffmpeg-location", ffmpegPath,

                    "-f",
                    quality === "highest"

                        ? "bv*+ba/b"
                        : `bv*[height<=${quality.replace("p", "")}]+ba/b`,

                    "--merge-output-format",
                    format,

                    "-o",
                    `${downloadPath}/%(title)s.%(ext)s`,

                    "--newline",

                    url

                ]);

                downloadManager.activeDownloads.set(item.id, job);

                job.on("spawn", () => {
                    console.log("Process started");



                });
                job.stderr.on("data", (data) => {
                    console.error(data.toString());
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
                    console.log(data.toString());
                });

            });



        } else if (item.type == "audio") {

            const bPath = getBinaryPaths();
            const ytdlpPath = bPath.ytdlp;
            const ffmpegPath = bPath.ffmpeg;

            const {
                id,
                quality,
                format,
                downloadPath,

            } = item;

            const url = `https://www.youtube.com/watch?v=${id}`;

            console.log("-----------------------------------------------------------------");
            console.log(item);
            console.log("URL:", item.url);
            console.log("-----------------------------------------------------------------");


            console.log("yt-dlp:", ytdlpPath);
            console.log("ffmpeg:", ffmpegPath);
            console.log("Download path:", downloadPath);

            console.log(downloadPath);
            return new Promise((resolve, reject) => {
                const job = spawn(ytdlpPath, [
                    "--ffmpeg-location", ffmpegPath,

                    "-f",
                    quality === "highest"

                        ? "bv*+ba/b"
                        : `bv*[height<=${quality.replace("p", "")}]+ba/b`,

                    "--merge-output-format",
                    format,

                    "-o",
                    `${downloadPath}/%(title)s.%(ext)s`,

                    "--newline",

                    url
                ]);

                job.on("spawn", () => {
                    console.log("Process started");



                });
                job.stderr.on("data", (data) => {
                    console.error(data.toString());
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
                    console.log(data.toString());
                });

            });



        }







    }
}

export default startDownload;