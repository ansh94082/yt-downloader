import { useState } from "react";
import DownloadCard from "../components/DownloadCard";
import "../styles/Home.css";

function Home() {

  const [url, setUrl] = useState("");

  const [downloads, setDownloads] = useState([]);

  const handleAnalyze = async () => {

    if (!url.trim()) {
      return;
    }

    // later:
    // const videoData =
    //   await window.api.analyzeVideo(url);

    const videoData = {
      id: Date.now(),
      url
    };

    setDownloads(prev => [
      videoData,
      ...prev
    ]);

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
          className="analyze-btn bg"
          onClick={handleAnalyze}
        >
          Enter
        </button>

      </div>

      <div className="downloads-container">

        {downloads.map(item => (
          <DownloadCard
            key={item.id}
            data={item}
          />
        ))}

      </div>

    </div>
  );
}

export default Home;