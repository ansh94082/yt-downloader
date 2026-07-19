// Home screen for entering a URL and reviewing the search results before queueing downloads.
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import DownloadCard from "../components/DownloadCard";
import "../styles/Home.css";
import toast from "react-hot-toast";

function Home() {

  const [url, setUrl] = useState("");
  const [downloads, setDownloads] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


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

    setIsAnalyzing(true);
    setDownloads([]);

    try {
      const videoData = await window.api.analyzeVideo(url);

      if (!videoData) {
        toast.error("No results were returned for that URL.");
        return;
      }

      setDownloads([videoData]);
      setUrl("");
    } catch (error) {
      console.error(error);
      toast.error("The analysis could not be completed.");
    } finally {
      setIsAnalyzing(false);
    }
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
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <span className="analyze-loading">
              <LoaderCircle size={18} className="spin" />
              Analyzing
            </span>
          ) : (
            "Enter"
          )}
        </button>

      </div>

      {isAnalyzing && (
        <div className="search-status" role="status" aria-live="polite">
          <LoaderCircle size={16} className="spin" />
          <span>Searching for your video...</span>
        </div>
      )}

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
