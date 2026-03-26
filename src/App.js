import React, { useState, useEffect } from "react";
import CameraGrid from "./components/CameraGrid";
import Settings from "./components/Settings";
import { mediaMtxApi } from "./utils/mediaMtxApi";
import "./App.css";

const DEFAULT_CAMERAS = [
    { name: "Tapo", ip: "192.168.1.9", user: "admin_cam", pass: "admin_cam", path: "/stream1" },
    { name: "Imou", ip: "192.168.1.7", user: "admin", pass: "admin_cam", path: "/cam/realmonitor?channel=1&subtype=1" }
];

export default function App() {
    const [cameras, setCameras] = useState(() => {
        const saved = localStorage.getItem("cam-viewer-config");
        return saved ? JSON.parse(saved) : DEFAULT_CAMERAS;
    });
    const [isSettingsMode, setIsSettingsMode] = useState(false);

    // Phase 2: Provision cameras on startup
    useEffect(() => {
        mediaMtxApi.provisionCameras(cameras);
    }, []);

    const handleSave = async (newConfig) => {
        // Filter out empty configurations
        const activeCams = newConfig.filter(c => c.ip && c.name);
        setCameras(activeCams);
        localStorage.setItem("cam-viewer-config", JSON.stringify(activeCams));
        
        // Phase 2: Sync with MediaMTX Backend
        await mediaMtxApi.provisionCameras(activeCams);
        
        setIsSettingsMode(false);
    };

    return (
        <div className="app">
            <div className="nav-bar">
                <h1 className="logo">CamViewer<span>.io</span></h1>
                <button 
                    className={`btn ${isSettingsMode ? "active" : ""}`}
                    onClick={() => setIsSettingsMode(!isSettingsMode)}
                >
                    {isSettingsMode ? "View Grid" : "Settings"}
                </button>
            </div>

            <main>
                {isSettingsMode ? (
                    <Settings 
                        initialCameras={cameras} 
                        onSave={handleSave} 
                        onCancel={() => setIsSettingsMode(false)}
                    />
                ) : (
                    <CameraGrid cameras={cameras} />
                )}
            </main>
        </div>
    );
}