function DownloadCard({ data }) {

  return (
    <div className="download-card">

      <div className="download-title">
        {data.url}
      </div>

      <div className="download-actions">

        <select>
          <option>Video</option>
          <option>Audio</option>
        </select>

        <select>
          <option>Best</option>
          <option>1080p</option>
          <option>720p</option>
        </select>

        <button>
          Download
        </button>

      </div>

    </div>
  );
}

export default DownloadCard;