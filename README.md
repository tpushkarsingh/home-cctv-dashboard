# 🎥 Universal Camera Viewer

[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MediaMTX](https://img.shields.io/badge/MediaMTX-v1.17-blue)](https://github.com/bluenviron/mediamtx)

Stop switching between five different apps just to see what’s happening around your house. **Universal Camera Viewer** is a simple, unified dashboard that brings all your home monitoring cameras (TP-Link, Dahua, Hikvision, etc.) into a single library in your web browser.

## 🏠 Why This Project?

I built this because I purchased several different brands of home monitoring cameras, only to find that **each one required its own separate app**. There was no single place to see all my cameras at once.

This project is an open-source solution for anyone facing the same challenge. It takes the "tech talk" (like RTSP and HLS) and handles it in the background so you can just focus on seeing your home.

## 📖 How to Use

Once you have the app running, follow these simple steps to start viewing your cameras:

1.  **Open the App**: Go to [http://localhost:3000](http://localhost:3000) in your web browser. You'll see the main dashboard where your camera feeds will appear.
    ![Dashboard Overview](./public/cam_dashboard.png)

2.  **Go to Settings**: Click on the **Settings** tab. This is where you configure your camera streams.
    ![Settings Configuration](./public/Setting.png)

3.  **Find Your Camera Details**: If you're using a common brand (like those found on a "Spy" camera website), you'll need the IP address and the RTSP path.
    ![Camera Home Example](./public/spycam_home.png)
    ![Camera Details Example](./public/spycam.png)

4.  **Add Your Cameras**:
    *   **Name**: A nickname for the camera (e.g., "Front Door").
    *   **IP Address**: The camera's local IP (e.g., `192.168.1.10`).
    *   **Username/Password**: Your camera credentials.
    *   **RTSP Path**: Often `/stream1` or `/live`. 

5.  **Save and View**: Click **Add Camera**. The app will automatically connect in the background. Navigate back to the **Dashboard** to see your live stream!

### ⚙️ Under the Hood: MediaMTX Config
For those who want to tweak the streaming engine, its configuration is in `mediamtx.yml`:
*   **API Management**: Port `9997` (Admin: `admin:admin`)
*   **Video Streams**: Port `8888`

## 🚀 How It Works

- **Unified Dashboard**: See all your cameras (regardless of the brand) in one grid.
- **Easy Setup**: Add a camera's IP address and credentials in the settings, and it appears instantly.
- **Works in Your Browser**: No need to install multiple apps on your phone or computer.

## ✨ Features

- **Live Grid Layout**: View multiple camera streams simultaneously.
- **Dynamic Configuration**: Add, edit, or remove cameras directly from the UI settings.
- **Auto-Sync**: The dashboard talks to the streaming engine for you.

## 🛠 Behind the Scenes

### 🏗 Architecture Diagram

Here’s how the data flows from your cameras to your screen:

```mermaid
graph TD
    subgraph "Your Home Network"
        Cam1[Camera 1: RTSP] 
        Cam2[Camera 2: RTSP]
        Cam3[Camera N: RTSP]
    end

    subgraph "Docker Container: MediaMTX"
        Ingest[RTSP Ingester]
        Trans[HLS Repackager]
        API[REST API v3]
        HLS_Server[HLS HTTP Server: 8888]
    end

    subgraph "Docker Container: Frontend"
        Dashboard[React Dashboard: 3000]
    end

    Cam1 & Cam2 & Cam3 -->|RTSP Stream| Ingest
    Ingest --> Trans
    Trans -->|index.m3u8 + segments| HLS_Server
    Dashboard -->|1. Sync Paths / Auth| API
    API -.->|Update Config| Ingest
    HLS_Server -->|2. Play Stream| Dashboard
```

### 🏗 How It Works (Technical Deep Dive)

Most security cameras use **RTSP (Real Time Streaming Protocol)**. It’s excellent for low-latency streaming between hardware (like a camera to a DVR), but it **cannot be played directly in a web browser.**

To solve this, we use a process called **RTSP-to-HLS Transformation**:

1.  **RTSP Ingestion**: **MediaMTX** (our streaming engine) connects to your camera's RTSP URL (e.g., `rtsp://admin:pass@192.168.1.50/stream1`) and pulls the raw video data.
2.  **HLS Packeting**: MediaMTX "chops" that continuous video stream into small, 1-second chunks (called segments, often `.ts` files).
3.  **The Playlist (`.m3u8`)**: It creates a master index file called `index.m3u8`. This file is essentially a text-based playlist that tells the browser exactly which small video chunk to play next to keep the stream going.
4.  **HTTP Serving**: These small video files are served over standard HTTP (port `8888`), making them look just like regular web files to your browser.
5.  **Frontend Playback**: The **React Dashboard** uses a library called `HLS.js`. It fetches the `.m3u8` playlist, downloads the segments one by one, and plays them seamlessly in a standard HTML5 `<video>` tag.

### 🧩 Tech Stack
- **Frontend**: React 18 with CSS Glassmorphism for a premium look.
- **Streaming Engine**: [MediaMTX](https://github.com/bluenviron/mediamtx) — a high-performance, lightweight server for RTSP, RTMP, and HLS.
- **Containerization**: Everything runs in **Docker**, so you don't have to worry about installing dependencies on your host machine.

## 📦 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop).

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd cam-viewer-home
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the Dashboard**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.


## 🛡 Security Note

This setup is intended for **local network use**. If you plan to expose this to the internet, please:
- Change the `admin` password in `mediamtx.yml` and `mediaMtxApi.js`.
- Use a reverse proxy (like Nginx/Traefik) with SSL (HTTPS).
- Enable authentication for the `read` action in `mediamtx.yml`.

---
Made with ❤️ for smart home enthusiasts.
