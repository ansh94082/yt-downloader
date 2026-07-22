# YT Downloader

A modern, fast, and privacy-friendly desktop application for downloading YouTube videos and audio.

Built with **Electron**, **React**, and **Node.js**, YT Downloader provides a clean desktop experience with support for high-quality downloads powered by `yt-dlp` and `FFmpeg`.

---

## ✨ Features

*  Download YouTube videos in multiple resolutions
*  Extract audio in different formats and qualities
*  Search YouTube directly from the application
*  Persistent download queue
*  Pause, resume, retry, and cancel downloads
*  Choose custom download locations
*  Fast downloads using `yt-dlp`
*  Modern desktop interface
*  Cross-platform architecture (Linux, Windows & macOS)

---

## Screenshots

<img width="1889" height="1031" alt="image" src="https://github.com/user-attachments/assets/0026c7c5-ee2f-4489-a621-d9eb261a334b" />

---

<img width="1896" height="1025" alt="image" src="https://github.com/user-attachments/assets/b76ca293-aa84-4c4b-89ca-c357a262eefa" />


---

## Tech Stack

| Technology     | Purpose                |
| -------------- | ---------------------- |
| Electron       | Desktop application    |
| React          | User Interface         |
| Node.js        | Backend & IPC          |
| yt-dlp         | Video extraction       |
| FFmpeg         | Audio/video processing |
| Electron Store | Persistent settings    |

---

## Installation

Clone the repository:

### For Dev build , use main branch  (and extract the resources if on linux)

```bash
git clone https://github.com/ansh94082/yt-downloader.git
cd yt-downloader
```

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

#### For build version clone the build repository (and extract resources in linux)

```bash
npm run dist:linux
```
---
```bash
npm run dist:win
```

---

## Project Structure

---

## Download Engine

YT Downloader uses:

* **yt-dlp** for extracting video information and downloading media.
* **FFmpeg** for merging video/audio streams and converting media formats.
* **FFprobe** for media inspection.

These binaries are bundled with the application and verified automatically during startup.

---

## Current Features

* Video downloads
* Audio downloads
* Download queue
* Download progress
* Pause/Resume downloads
* Download history
* Custom download folder

---

## Roadmap

* [ ] Playlist downloads
* [ ] Channel downloads
* [ ] Subtitle support
* [ ] Scheduled downloads
* [ ] Batch URL importing
* [ ] Download speed limiter
* [ ] Theme customization
* [ ] Automatic application updates

---

## Contributing

Contributions are welcome.

If you'd like to improve the project:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

* yt-dlp
* FFmpeg
* Electron
* React
* Vite

---

Made with ❤️ by **Ansh**
