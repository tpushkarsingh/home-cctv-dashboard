import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function CameraPlayer({ url }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        let hls;

        // iOS / mobile native playback
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(() => { });
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                lowLatencyMode: true,
                liveSyncDurationCount: 1,
                maxBufferLength: 2
            });

            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });
        }

        return () => {
            if (hls) hls.destroy();
        };
    }, [url]);

    return (
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
        />
    );
}