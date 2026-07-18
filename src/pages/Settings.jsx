// Settings screen for application preferences and download destination selection.
import { useEffect, useState } from "react";
import "../styles/Settings.css";

const Settings = () => {
  const [settings, setSettings] = useState({
    audioFormat: "mp3",
    audioQuality: "320",
    videoFormat: "mp4",
    videoQuality: "1080",
    theme: "dark",
    downloadFolder: ""
  });

  const [originalSettings, setOriginalSettings] = useState({});



  useEffect(() => {
    const loadSettings = async () => {

      const data =
        await window.api.getSettings();

      setSettings(data);
      setOriginalSettings(data);

      if (data.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          data.theme
        );
      }
    };

    loadSettings();
  }, []);




  const selectfolder = async () => {

    const foldata =
      await window.api.selectFolder();


    if (foldata !== null) {
      handleChange(
        "downloadFolder",
        foldata
      );
    }
  };








  const handleChange = (field, value) => {
    setSettings(prev => ({   // invoked when user changes settings, but not saved yet
      ...prev,
      [field]: value
    }));
  };

  const changeTheme = (theme) => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  const handleSave = async () => {
    await window.api.saveSettings(settings); // user clicks save button

    setOriginalSettings(settings);
  };

  const handleCancel = () => {
    setSettings(originalSettings); // user cancels the changed settings , so we call back previous settings

    if (originalSettings.theme) {
      document.documentElement.setAttribute(
        "data-theme",
        originalSettings.theme
      );
    }

  };


  return (
    <div className="settings-page">

      <h1 className="settings-title">
        Settings
      </h1>

      <section className="settings-section">

        <h2 className="section-title">
          Download Folder
        </h2>

        <div className="folder-picker">

          <input
            className="folder-path"
            readOnly
            title={settings.downloadFolder}
            value={settings.downloadFolder}
          />

          <button
            className="browse-button"
            onClick={selectfolder}
          >
            Browse
          </button>

        </div>

      </section>

      <div className="settings-grid">

        <section className="settings-card">

          <h2 className="card-title" >
            Audio Defaults
          </h2>

          <div className="settings-row">

            <div className="setting-item">
              <label>Format</label>

              <select
                value={settings.audioFormat}
                onChange={(e) =>
                  handleChange(
                    "audioFormat",
                    e.target.value
                  )
                }
              >
                <option value="mp3">MP3</option>
                <option value="m4a">M4A</option>
                <option value="flac">FLAC</option>
                <option value="wav">WAV</option>
                <option value="original">Original</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Quality</label>

              <select
                value={settings.audioQuality}
                onChange={(e) =>
                  handleChange(
                    "audioQuality",
                    e.target.value
                  )
                }
              >
                <option value="best">Best Available</option>
                <option value="320">320 kbps</option>
                <option value="256">256 kbps</option>
                <option value="192">192 kbps</option>
                <option value="128">128 kbps</option>
              </select>
            </div>

          </div>

        </section>

        <section className="settings-card">

          <h2 className="card-title">
            Video Defaults
          </h2>

          <div className="settings-row">

            <div className="setting-item">
              <label>Format</label>

              <select
                value={settings.videoFormat}
                onChange={(e) =>
                  handleChange(
                    "videoFormat",
                    e.target.value
                  )
                }
              >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
                <option value="webm">WEBM</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Quality</label>

              <select
                value={settings.videoQuality}
                onChange={(e) =>
                  handleChange(
                    "videoQuality",
                    e.target.value
                  )
                }
              >
                <option value="best">Best Available</option>
                <option value="2160">2160p (4K)</option>
                <option value="1440">1440p</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </select>
            </div>

          </div>

        </section>

      </div>

      <section className="settings-section">

        <div className="theme-header">

          <h2 className="section-title">
            Theme
          </h2>

          <div className="theme-selector">

            <button
              className={`theme-button ${settings.theme === "dark"
                ? "theme-selected"
                : ""
                }`}
              onClick={() => changeTheme("dark")}
            >
              Dark
            </button>

            <button
              className={`theme-button ${settings.theme === "frutiger"
                ? "theme-selected"
                : ""
                }`}
              onClick={() => changeTheme("frutiger")}
            >
              Frutiger Aero
            </button>

            <button
              className={`theme-button ${settings.theme === "y2k"
                ? "theme-selected"
                : ""
                }`}
              onClick={() => changeTheme("y2k")}
            >
              Y2K
            </button>

          </div>

        </div>

      </section>

      <section className="settings-actions">

        <button
          className="secondary-button"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <button
          className="primary-button"
          onClick={handleSave}
        >
          Save
        </button>

      </section>

    </div>
  );
};

export default Settings;