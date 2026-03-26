import React, { useState } from "react";

export default function Settings({ initialCameras, onSave, onCancel }) {
    const [cameras, setCameras] = useState(initialCameras || [
        { name: "", ip: "", user: "", pass: "" },
        { name: "", ip: "", user: "", pass: "" },
        { name: "", ip: "", user: "", pass: "" },
        { name: "", ip: "", user: "", pass: "" }
    ]);

    const handleChange = (index, field, value) => {
        const newCameras = [...cameras];
        newCameras[index][field] = value;
        setCameras(newCameras);
    };

    const handleRemove = (index) => {
        const newCameras = cameras.filter((_, i) => i !== index);
        setCameras(newCameras);
    };

    const handleAdd = () => {
        if (cameras.length < 4) {
            setCameras([...cameras, { name: "", ip: "", user: "", pass: "" }]);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <div className="title-group">
                    <h2>Camera Configuration</h2>
                    <p className="subtitle">Configure up to 4 RTSP camera streams</p>
                </div>
                <div className="actions">
                    <button className="btn outline" onClick={onCancel}>Cancel</button>
                    <button className="btn primary" onClick={() => onSave(cameras)}>Save Configuration</button>
                </div>
            </div>
            
            <div className="settings-grid">
                {cameras.map((cam, i) => (
                    <div key={i} className="config-card">
                        <div className="card-header">
                            <h3>Camera {i + 1}</h3>
                            <button className="btn-icon delete" onClick={() => handleRemove(i)} title="Remove Camera">
                                &times;
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Living Room" 
                                value={cam.name} 
                                onChange={(e) => handleChange(i, "name", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>IP Address</label>
                            <input 
                                type="text" 
                                placeholder="192.168.1.XX" 
                                value={cam.ip} 
                                onChange={(e) => handleChange(i, "ip", e.target.value)}
                            />
                        </div>
                        <div className="form-group rtsp-group">
                            <label>RTSP Path</label>
                            <input 
                                type="text" 
                                placeholder="/stream1 or /cam/realmonitor..." 
                                value={cam.path || ""} 
                                onChange={(e) => handleChange(i, "path", e.target.value)}
                            />
                            <div className="help-text">
                                Common: <strong>Tapo</strong> (/stream1), <strong>Imou</strong> (/cam/realmonitor?channel=1&subtype=0)<br/>
                                Need help? Check <a href="https://www.ispyconnect.com/cameras" target="_blank" rel="noreferrer">iSpyConnect</a>.
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    value={cam.user} 
                                    onChange={(e) => handleChange(i, "user", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    value={cam.pass} 
                                    onChange={(e) => handleChange(i, "pass", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {cameras.length < 4 && (
                    <button className="add-card" onClick={handleAdd}>
                        <span className="plus">+</span>
                        <span>Add Camera</span>
                    </button>
                )}
            </div>
        </div>
    );
}
