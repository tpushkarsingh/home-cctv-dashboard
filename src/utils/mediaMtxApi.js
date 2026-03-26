// src/utils/mediaMtxApi.js

const API_BASE = `http://${window.location.hostname}:9997/v3`;
const AUTH_HEADER = { 'Authorization': 'Basic ' + btoa('admin:admin') };

export const mediaMtxApi = {
    /**
     * Provision multiple cameras and remove any that are no longer in the list.
     */
    async provisionCameras(cameras) {
        console.log("Syncing cameras with MediaMTX...", cameras);

        // 1. Get current paths from MediaMTX to identify what to delete
        let currentPaths = [];
        try {
            const res = await fetch(`${API_BASE}/config/paths/list`, { headers: AUTH_HEADER });
            const data = await res.json();
            currentPaths = (data.items || []).map(item => item.name);
        } catch (err) {
            console.error("Failed to list paths for sync:", err);
        }

        const newPathNames = cameras
            .filter(c => c.name && c.ip)
            .map(c => c.name.toLowerCase().replace(/\s+/g, '_'));

        // 2. Delete paths that are no longer in the cameras list
        for (const path of currentPaths) {
            // Avoid deleting system paths if any exist (though usually empty by default)
            if (!newPathNames.includes(path)) {
                await this.deletePath(path);
            }
        }

        // 3. Add or Update remaining paths
        for (const cam of cameras) {
            if (!cam.name || !cam.ip) continue;

            const pathName = cam.name.toLowerCase().replace(/\s+/g, '_');
            const rtspPath = cam.path?.startsWith('/') ? cam.path : `/${cam.path || 'stream1'}`;
            const sourceUrl = `rtsp://${cam.user}:${cam.pass}@${cam.ip}:554${rtspPath}`;
            const exists = currentPaths.includes(pathName);

            try {
                if (!exists) {
                    // Only POST if it doesn't exist
                    await fetch(`${API_BASE}/config/paths/add/${pathName}`, {
                        method: 'POST',
                        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            source: sourceUrl,
                            rtspTransport: 'tcp'
                        })
                    });
                    console.log(`Path ${pathName} added to MediaMTX.`);
                } else {
                    // Update existing path
                    await fetch(`${API_BASE}/config/paths/patch/${pathName}`, {
                        method: 'PATCH',
                        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            source: sourceUrl,
                            rtspTransport: 'tcp'
                        })
                    });
                    console.log(`Path ${pathName} updated in MediaMTX.`);
                }
            } catch (err) {
                console.error(`Failed to sync path ${pathName}:`, err);
            }
        }
    },

    async deletePath(name) {
        try {
            await fetch(`${API_BASE}/config/paths/delete/${name}`, {
                method: 'DELETE',
                headers: AUTH_HEADER
            });
            console.log(`Path ${name} deleted from MediaMTX.`);
        } catch (err) {
            console.error(`Failed to delete path ${name}:`, err);
        }
    },

    async listPaths() {
        const res = await fetch(`${API_BASE}/paths/list`, { headers: AUTH_HEADER });
        return await res.json();
    }
};
