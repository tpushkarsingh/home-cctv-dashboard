// src/components/CameraGrid.js
import React, { useState } from "react";
import CameraPlayer from "./CameraPlayer";

export default function CameraGrid({ cameras }) {
    const hostname = window.location.hostname || "localhost";
    
    // Refresh keys force remount of CameraPlayer to restart Hls.js
    const [refreshKeys, setRefreshKeys] = useState(
        new Array(cameras.length).fill(0)
    );

    const handleRefresh = (index) => {
        const newKeys = [...refreshKeys];
        newKeys[index] += 1;
        setRefreshKeys(newKeys);
    };

    const handleFullscreen = (tileElementId) => {
        const elem = document.getElementById(tileElementId);
        if (!elem) return;

        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            }
        }
    };

    const gridClass = `grid count-${Math.min(cameras.length, 4)}`;

    return (
        <div className={gridClass}>
            {cameras.map((cam, index) => {
                const path = cam.name.toLowerCase().replace(/\s+/g, '_');
                const url = `http://${hostname}:8888/${path}/index.m3u8`;
                const tileId = `tile-${index}`;
                
                return (
                    <div key={index} id={tileId} className="tile">
                        <CameraPlayer key={refreshKeys[index]} url={url} />
                        <div className="label">{cam.name}</div>
                        
                        <div className="tile-overlay">
                            <div className="tile-controls">
                                <button className="btn-control" onClick={() => handleRefresh(index)} title="Refresh Stream">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                    </svg>
                                </button>
                                <button className="btn-control" onClick={() => handleFullscreen(tileId)} title="Fullscreen">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}