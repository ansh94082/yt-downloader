import { spawn } from 'node:child_process';
import { getBinaryPaths } from './binaries.js';
import { areBinariesHealthy } from './verify.js';


function isUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}


export async function softSearch(query) {

    console.log("SEARCH QUERY:", query);

    console.log('healthy?', areBinariesHealthy());
    if (!areBinariesHealthy()) {
        throw new Error('Ill-configured binaries');
    }

    const { ytdlp, ffmpeg } = getBinaryPaths();

    if (!isUrl(query)) {

        return new Promise((resolve, reject) => {
            const start = performance.now();
            const child = spawn(ytdlp, [
                `ytsearch10:${query}`,
                '--dump-single-json',
                '--flat-playlist',

            ]);

            let output = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('error', reject);

            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(stderr));
                    return;
                }

                try {
                    const data = JSON.parse(output);

                    resolve({
                        entries: (data.entries || []).map(video => ({
                            id: video.id,
                            title: video.title,
                            duration: video.duration,
                            channel: video.channel,
                            view_count: video.view_count,
                            upload_date: video.upload_date,

                            thumbnail:
                                video.thumbnails?.at(-1)?.url ??
                                video.thumbnails?.[0]?.url ??
                                `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
                        }))
                    });
                    console.log(
                        "yt-dlp took",
                        performance.now() - start,
                        "ms"
                    );

                } catch (err) {
                    reject(err);
                }
            });
        });
    } else {

        return new Promise((resolve, reject) => {
            console.log("SPAWNING:", ytdlp);

            const child = spawn(ytdlp, [
                '--dump-single-json',
                query
            ]);

            let output = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                const msg = data.toString();

                stderr += msg;

                console.log("STDERR:", msg);
            });

            child.on('error', (err) => {
                console.log("SPAWN ERROR:", err);
                reject(err);
            });

            child.on('close', (code) => {
                console.log("EXIT CODE:", code);
                console.log("OUTPUT LENGTH:", output.length);

                if (code !== 0) {
                    reject(new Error(stderr));
                    return;
                }

                try {
                    const data = JSON.parse(output);

                    const result = {
                        entries: [
                            {
                                id: data.id,
                                title: data.title,
                                duration: data.duration,
                                channel: data.channel,
                                view_count: data.view_count,
                                upload_date: data.upload_date,
                                thumbnail: data.thumbnail,
                                webpage_url: data.webpage_url
                            }
                        ]
                    };

                    console.log("RESULT:", result);

                    resolve(result);

                } catch (err) {
                    console.error("JSON PARSE FAILED");
                    console.error(output);
                    reject(err);
                }
            });
        });

    }
}