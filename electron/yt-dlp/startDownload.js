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


const startDownload = (item) => {


    if (!preChecks) { // take the failed job and send to main process to store in the jobStore

        item.status = "failed"
        const sendFail = async () => {
            await window.api.handleEnter(item);

        }


    } else {
        item.status = "downloading"
        const sendStat = async () => { await window.api.handleEnter(item); console.log("entry committed") }


        if (item.type == "video") {

            const {
                url,
                quality,
                format,
                downloadPath
            } = item;

            const job = spawn(ytdlpPath, [
                "--ffmpeg-location", ffmpegPath,
                "--ffprobe-location", ffprobePath,

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



















        }


    }






}

export default startDownload;