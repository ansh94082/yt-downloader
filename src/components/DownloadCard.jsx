// Search result card that collects download options before sending a job into the queue.
import { useState } from "react";
import { Download, Video, Music, Eye, X } from "lucide-react";
import "../styles/themes.css";



function DownloadCard({ data }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("video");
  const [stats, setStats] = useState({ type: "video", quality: "highest", format: "mp4" });
  const [videodef, setVideodef] = useState(false);
  const [audiodef, setAudiodef] = useState(false);
  const [audioformat, setAudioformat] = useState(false); // this serves a simple iportant purpose , when user changes from video to audio , its important to select the format , in case of not doing this we may pick quality in audio , but video format  
  const [videoformat, setVideoformat] = useState(false); // similiar to audio

  const formatViews = (views) => { if (!views) return "0"; if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`; if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`; if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`; return views.toString(); };
  const formatDuration = (seconds) => { if (!seconds) return "0:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, "0")}`; };

 
  const handleDownload = async () => {


    const downPath = await window.api.getDefaultDownloadPath();

    let vidObj = {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      type: stats.type,
      format: stats.format,
      quality: stats.quality,
      downloadPath: downPath,
      status: "queued",
      createdAt: Date.now(),
      startedAt: null,

      finishedAt: null,
      progress: 0,
      speed: null,
      eta: null,
      error: null

    }


    await window.api.startDownload(vidObj);

  }





  return (
    <div className="relative">
      <div
        className=" group flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
      >
        <div className="relative h-28 w-48 shrink-0 overflow-hidden rounded-xl">
          <img
            src={data.thumbnail}
            alt={data.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/50
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-2
              right-2
              rounded-md
              bg-black/70
              px-2
              py-1
              text-xs
              font-medium
              text-white
            "
          >
            {formatDuration(data.duration)}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h3
            className="
              line-clamp-2
              text-sm
              font-semibold
              leading-5
            "
          >
            {data.title}
          </h3>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-2
              text-xs
              opacity-70
            "
          >
            <span>{data.channel}</span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatViews(data.view_count)}
            </span>
          </div>

          <div className="mt-auto flex justify-end">
            <button
              onClick={() => setOpen(!open)}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                hover:brightness-110
              "
              style={{
                background: "var(--accent)",
                color: "var(--button-text, white)",
              }}
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            z-50
            mt-3
            w-80
            rounded-2xl
            p-4
            shadow-2xl
            backdrop-blur-xl
          "
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium">Download Options</h4>

            <button
              onClick={() => setOpen(false)}
              className="
                rounded-lg
                p-2
                transition
                hover:bg-black/10
              "
            >
              <X
                size={18}
                style={{
                  color: "var(--text)",
                }}
              />
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("video")}
              className="
                flex-1
                rounded-xl
                py-2
                text-sm
                font-medium
                transition
              "
              style={
                tab === "video"
                  ? {
                    background: "var(--accent)",
                    color: "var(--button-text, white)",
                  }
                  : {
                    border: "1px solid var(--border)",
                  }
              }
            >
              <div className="flex items-center justify-center gap-2">
                <Video size={15} />
                Video
              </div>
            </button>

            <button
              onClick={() => setTab("audio")}
              className="
                flex-1
                rounded-xl
                py-2
                text-sm
                font-medium
                transition
              "
              style={
                tab === "audio"
                  ? {
                    background: "var(--accent)",
                    color: "var(--button-text, white)",
                  }
                  : {
                    border: "1px solid var(--border)",
                  }
              }
            >
              <div className="flex items-center justify-center gap-2">
                <Music size={15} />
                Audio
              </div>
            </button>
          </div>

          {tab === "video" && (
            <div className="space-y-3">
              <div className="flex gap-7">
                {!videodef && (<button className=" flex-1 rounded-xl py-2 text-sm p-3 font-medium transition "
                  style={{ background: "var(--accent)", color: "var(--button-text, white)", }}
                  onClick={() => { setVideodef(true); setVideoformat(false) }}>
                  default

                </button>)}
                {videodef && (<button className=" flex-1 rounded-xl py-2 text-sm p-3 font-medium transition "
                  style={{ border: "1px solid var(--border)" }}

                  onClick={() => setVideodef(false)}>
                  cancel default

                </button>)}
              </div>
              {!videodef && (<div className="flex gap-2">

                <select
                  className="
                  w-full
                  rounded-xl
                  px-3
                  py-3
                "
                  onChange={(e) => {
                    setStats(prev => ({
                      ...prev,
                      quality: e.target.value,
                      type: tab,
                    }));
                    setVideoformat(true);
                  }}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <option>highest </option>
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                  <option>360p</option>

                </select>

                {videoformat && (<select
                  className="
                  w-full
                  rounded-xl
                  px-3
                  py-3
                "
                  onChange={(e) => {
                    setStats(prev => ({
                      ...prev, format: e.target.value,
                      type: tab
                    }));
                  }
                  }
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <option>mp4</option>
                  <option>webm</option>
                  <option>mkv</option>
                </select>)}




              </div>)}

              <button
                className="
                  w-full
                  rounded-xl
                  py-3
                  font-medium
                  transition
                  hover:brightness-110
                "
                style={{
                  background: "var(--accent)",
                  color: "var(--button-text, white)",
                }}
                onClick={handleDownload}
              >
                Download Video
              </button>
            </div>
          )}

          {tab === "audio" && (
            <div className="space-y-3">
              <div className="flex gap-7">
                {!audiodef && (<button className=" flex-1 rounded-xl py-2 text-sm p-3 font-medium transition "
                  style={{ background: "var(--accent)", color: "var(--button-text, white)", }}
                  onClick={() => setAudiodef(true)}>
                  default

                </button>)}
                {audiodef && (<button className=" flex-1 rounded-xl py-2 text-sm p-3 font-medium transition "
                  style={{ border: "1px solid var(--border)" }}

                  onClick={() => setAudiodef(false)}>
                  cancel default

                </button>)}
              </div>
              {!audiodef && (<div className="flex gap-2">
                <select
                  className="
                  w-full
                  rounded-xl
                  px-3
                  py-3
                "
                  onChange={(e) => {
                    setStats(prev => ({
                      ...prev, quality: e.target.value, type: tab,
                    })); setAudioformat(true)
                  }}

                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",


                  }}
                >
                  <option>Highest </option>
                  <option>256 kbps</option>
                  <option>128 kbps</option>
                </select>

                {audioformat && (<select
                  className="
                  w-full
                  rounded-xl
                  px-3
                  py-3
                "
                  onChange={(e) => {
                    setStats(prev => ({
                      ...prev, format: e.target.value, type: tab,
                    })); setAudioformat(true)
                  }}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <option>mp3</option>
                  <option>m4a</option>
                  <option>flac</option>
                  <option>wav</option>
                </select>)}
              </div>)}

              <button
                className="
                  w-full
                  rounded-xl
                  py-3
                  font-medium
                  transition
                  hover:brightness-110
                "
                onClick={handleDownload}
                style={{
                  background: "var(--accent)",
                  color: "var(--button-text, white)",
                }}
              >
                Download Audio
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DownloadCard;
