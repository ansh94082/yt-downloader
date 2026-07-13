import { useMemo, useState, useEffect } from "react";
import { Download, Clock3, CheckCircle2, XCircle, Activity } from "lucide-react";
import DownloadQueueCard from "../components/DownloadQueueCard";
import "../styles/Downloads.css";


const FILTERS = [
  {
    key: "all",
    title: "All",
    icon: Download
  },
  {
    key: "downloading",
    title: "Downloading",
    icon: Activity
  },
  {
    key: "queued",
    title: "Queued",
    icon: Clock3
  },
  {
    key: "finished",
    title: "Finished",
    icon: CheckCircle2
  },
  {
    key: "failed",
    title: "Failed",
    icon: XCircle
  }
];

function Downloads() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");



  useEffect(() => {
    const load = async () => {
      const data = await window.api.getJobs();
      setJobs(data);
    }
    load();
  }, []);


  const counts = useMemo(() => {
    const c = {
      all: jobs.length,
      downloading: 0,
      queued: 0,
      finished: 0,
      failed: 0
    };

    jobs.forEach(job => {
      switch (job.status) {
        case "downloading":
        case "paused":
          c.downloading++;
          break;
        case "queued":
          c.queued++;
          break;
        case "finished":
          c.finished++;
          break;
        case "failed":
          c.failed++;
          break;
      }
    });

    return c;

  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let arr = [...jobs];

    if (filter !== "all") {
      switch (filter) {
        case "downloading":
          arr = arr.filter(job =>
            job.status === "downloading" ||
            job.status === "paused"
          );
          break;
        case "queued":
          arr = arr.filter(job =>
            job.status === "queued"
          );
          break;
        default:
          arr = arr.filter(job =>
            job.status === filter
          );
      }
    }

    arr.sort(
      (a, b) =>
        b.createdAt - a.createdAt
    );

    return arr;

  }, [jobs, filter]);

  const queuedIds = jobs.filter(j => j.status === "queued").map(j => j.id);


  return (

    <div className="downloads-page">
      <div className="downloads-header">
        <div>
          <h1>Downloads</h1>
          <p>Manage all downloads</p>

        </div>

        <div className="downloads-summary">
          <div className="summary-card">
            <h3>{counts.downloading}</h3>
            <span>
              Active
            </span>
          </div>

          <div className="summary-card">
            <h3>{counts.queued}</h3>

            <span>
              Queued
            </span>

          </div>

          <div className="summary-card">
            <h3>{counts.finished}</h3>

            <span>Finished</span>

          </div>
        </div>
      </div>


      <div className="downloads-toolbar">
        <div className="filter-row">
          {
            FILTERS.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  className={`filter-btn ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  <Icon size={16} />
                  <span>
                    {f.title}
                  </span>

                  <span>
                    {counts[f.key]}
                  </span>
                </button>
              );
            })
          }
        </div>
      </div>

      <div className="downloads-list">
        {
          filteredJobs.length === 0 &&
          <div className="downloads-empty">
            <Download size={70} />
            <h3>
              No Downloads
            </h3>
            <p>
              Downloads will appear here.
            </p>
          </div>
        }
        {
          filteredJobs.map(job => (
            <DownloadQueueCard
              key={job.id}
              job={job}
              isFirstQueued={
                queuedIds.indexOf(job.id) === 0
              }
              isLastQueued={
                queuedIds.indexOf(job.id) === queuedIds.length - 1
              }
              onPause={(id) =>
                window.api.pauseDownload(id)
              }
              onResume={(id) =>
                window.api.resumeDownload(id)
              }
              onCancel={(id) =>
                window.api.cancelDownload(id)
              }
              onRetry={(id, stats) =>
                window.api.retryDownload(id, stats)
              }
              onOpenFolder={(path) =>
                window.api.openFolder(path)
              }
              onReorder={(id, direction) =>
                window.api.reorderQueue(id, direction)
              }
            />
          ))
        }
      </div>
    </div>
  );

}

export default Downloads;