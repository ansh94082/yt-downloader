import { useState , useEffect } from "react";
import DownloadCard from "../components/DownloadCard";
import "../styles/Home.css";
import toast from "react-hot-toast";

function Home() {

  const [url, setUrl] = useState("");

  const [downloads, setDownloads] = useState([]);


  useEffect(() => {
    const seenIds = new Set();

    const unsubscribe = window.api.onDownloadStarted((item) => {
      if (!item?.id || seenIds.has(item.id)) return;

      seenIds.add(item.id);
      toast.success(`${item.title} added to queue`);
    });

    return () => {
      unsubscribe();
    };
  }, []);


  const handleAnalyze = async () => {

    if (!url.trim()) {
      return;
    }

    const videoData = await window.api.analyzeVideo(url);
    console.log(videoData);

    if (!videoData) {
      console.error("NO DATA RETURNED");
      return;
    }

    setDownloads([videoData]);

    setUrl("");
  };

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleAnalyze();
    }

  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">
          YT Downloader
        </h1>

        <p className="home-subtitle">
          Download videos and audio
        </p>
      </div>

      <div className="input-bar">

        <input
          className="url-input"
          placeholder="Paste YouTube URL..."
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          className="analyze-btn primary-button"
          onClick={handleAnalyze}
        >
          Enter
        </button>

      </div>

      <div className="downloads-container">

        <div className="downloads-container">

          {downloads.map(item =>
            item.entries?.map(video => (
              <DownloadCard
                key={video.id}
                data={video}
              />
            ))
          )}

        </div>
      </div>

    </div>
  );
}

export default Home;
