import { useMemo, useState } from "react";

import {
  Pause,
  Play,
  RotateCcw,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  X,
  Clock3,
  Video,
  Music,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

/* ----------------------------------
   Helpers
----------------------------------- */

function formatSpeed(speed) {
  if (!speed) return "--";

  if (speed >= 1024 * 1024) {
    return `${(speed / 1024 / 1024).toFixed(1)} MB/s`;
  }

  return `${(speed / 1024).toFixed(1)} KB/s`;
}

function formatETA(seconds) {
  if (seconds === null || seconds === undefined) return "--";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatSize(bytes) {
  if (!bytes) return "--";

  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ----------------------------------
   Component
----------------------------------- */

function DownloadQueueCard({
  job,

  isFirstQueued,
  isLastQueued,

  onPause,
  onResume,
  onCancel,

  onRetry,

  onOpenFolder,

  onReorder,
}) {
  /* ----------------------------------
     Local State
  ----------------------------------- */

  const [retryOpen, setRetryOpen] = useState(false);

  const [retryTab, setRetryTab] = useState(
    job.type === "audio" ? "audio" : "video"
  );

  const [retryStats, setRetryStats] = useState({
    type: job.type || "video",
    quality: job.quality || "highest",
    format:
      job.format ||
      (job.type === "audio" ? "mp3" : "mp4"),
  });

  /* ----------------------------------
     Derived State
  ----------------------------------- */

  const isQueued = job.status === "queued";

  const isDownloading =
    job.status === "downloading";

  const isPaused =
    job.status === "paused";

  const isFinished =
    job.status === "finished";

  const isFailed =
    job.status === "failed";

  const progress = Math.max(
    0,
    Math.min(100, job.progress || 0)
  );

  const canMoveUp =
    isQueued && !isFirstQueued;

  const canMoveDown =
    isQueued && !isLastQueued;

  /* ----------------------------------
     Status Badge
  ----------------------------------- */

  const status = useMemo(() => {
    switch (job.status) {
      case "queued":
        return {
          label: "Queued",
          icon: Clock3,
          className: "queued",
        };

      case "downloading":
        return {
          label: "Downloading",
          icon: LoaderCircle,
          className: "downloading",
        };

      case "paused":
        return {
          label: "Paused",
          icon: Pause,
          className: "paused",
        };

      case "finished":
        return {
          label: "Finished",
          icon: CheckCircle2,
          className: "finished",
        };

      case "failed":
        return {
          label: "Failed",
          icon: AlertCircle,
          className: "failed",
        };

      default:
        return {
          label: "Unknown",
          icon: Clock3,
          className: "queued",
        };
    }
  }, [job.status]);

  const StatusIcon = status.icon;

  /* ----------------------------------
     Event Handlers
  ----------------------------------- */

  function handlePause() {
    onPause?.(job.id);
  }

  function handleResume() {
    onResume?.(job.id);
  }

  function handleCancel() {
    if (
      window.confirm(
        `Cancel "${job.title}"?`
      )
    ) {
      onCancel?.(job.id);
    }
  }

  function handleRetry() {
    onRetry?.(
      job.id,
      retryStats
    );

    setRetryOpen(false);
  }

  function handleOpenFolder() {
    onOpenFolder?.(
      job.downloadPath
    );
  }

  function moveUp() {
    if (canMoveUp) {
      onReorder?.(
        job.id,
        "up"
      );
    }
  }

  function moveDown() {
    if (canMoveDown) {
      onReorder?.(
        job.id,
        "down"
      );
    }
  }

  /* ----------------------------------
     JSX goes here
  ----------------------------------- */
  return (
    <>
      <div className="queue-card">

        <div className="queue-thumbnail">

          <img
            src={job.thumbnail}
            alt={job.title}
          />

          {
            isDownloading &&

            <div className="thumbnail-overlay">

              <LoaderCircle
                size={26}
                className="spin"
              />

            </div>
          }

        </div>

        <div className="queue-body">

          <div className="queue-top">

            <div className="queue-info">

              <h3>

                {job.title}

              </h3>

              <div className="queue-meta">

                {
                  job.type === "video"

                    ?

                    <Video size={15} />

                    :

                    <Music size={15} />

                }

                <span>

                  {job.quality}

                </span>

                <span>

                  •

                </span>

                <span>

                  {job.format.toUpperCase()}

                </span>

              </div>

            </div>

            <div className={`status-badge ${status.className}`}>

              <StatusIcon

                size={15}

                className={
                  isDownloading
                    ? "spin"
                    : ""
                }

              />

              {status.label}

            </div>

          </div>

          {
            (isDownloading || isPaused) &&

            <>

              <div className="progress-header">

                <span>

                  {progress.toFixed(1)}%

                </span>

                <span>

                  {formatSpeed(job.speed)}

                </span>

                <span>

                  ETA {formatETA(job.eta)}

                </span>

              </div>

              <div className="progress-bar">

                <div

                  className="progress-fill"

                  style={{

                    width: `${progress}%`

                  }}

                />

              </div>

            </>

          }

          {

            isFinished &&

            <div className="download-info">

              <span>

                Finished

              </span>

              {

                job.totalBytes &&

                <span>

                  {formatSize(job.totalBytes)}

                </span>

              }

            </div>

          }

          {

            isFailed &&

            <div className="download-error">

              {job.error || "Download failed."}

            </div>

          }

          <div className="queue-actions">
            {
              isDownloading &&

              <>

                <button

                  className="primary-button"

                  onClick={handlePause}

                >

                  <Pause size={16} />

                  Pause

                </button>

                <button

                  className="primary-button"

                  onClick={handleCancel}

                >

                  <X size={16} />

                  Cancel

                </button>

              </>

            }
            {
              isPaused &&

              <>

                <button

                  className="primary-button"

                  onClick={handleResume}

                >

                  <Play size={16} />

                  Resume

                </button>

                <button

                  className="primary-button"

                  onClick={handleCancel}

                >

                  <X size={16} />

                  Cancel

                </button>

              </>

            }
            {
              isQueued &&

              <>

                <button

                  disabled={!canMoveUp}

                  className="primary-button"

                  onClick={moveUp}

                >

                  <ArrowUp size={16} />

                </button>

                <button

                  disabled={!canMoveDown}

                  className="primary-button"

                  onClick={moveDown}

                >

                  <ArrowDown size={16} />

                </button>

                <button

                  className="primary-button"

                  onClick={handleCancel}

                >

                  <X size={16} />

                  Remove

                </button>

              </>

            }
            {
              isFinished &&

              <button

                className="primary-button"

                onClick={handleOpenFolder}

              >

                <FolderOpen size={16} />

                Open Folder

              </button>

            }
            {
              isFailed &&

              <>

                <button

                  className="primary-button"

                  onClick={() =>

                    setRetryOpen(true)

                  }

                >

                  <RotateCcw size={16} />

                  Retry

                </button>

                <button

                  className="primary-button"

                  onClick={() =>

                    setRetryOpen(true)

                  }

                >

                  Settings

                </button>

              </>

            }
          </div>

        </div>

      </div>

      {
        retryOpen &&

        <RetryDialog

          retryTab={retryTab}

          setRetryTab={setRetryTab}

          retryStats={retryStats}

          setRetryStats={setRetryStats}

          onRetry={handleRetry}

          onClose={() =>

            setRetryOpen(false)

          }

        />
      }

    </>
  );
}

export default DownloadQueueCard;