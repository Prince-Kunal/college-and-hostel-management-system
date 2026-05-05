import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    VideoConference,
    DisconnectButton,
    ControlBar
} from '@livekit/components-react';
import '@livekit/components-styles';
import './VideoRoom.css'; // We'll create this to override some LiveKit vars

export default function VideoRoom() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const state = location.state;
    const stored = JSON.parse(localStorage.getItem("livekit") || "{}");

    const roomName = state?.roomName || stored.roomName || "Live Session";
    const rawToken = state?.token || stored.token;
    
    const token = typeof rawToken === "string" ? rawToken : rawToken?.token;

    if (typeof token !== "string") {
        return (
            <div className="live-room-error">
                <div className="error-card">
                    <h2>Connection Error</h2>
                    <p>Invalid or missing access token. Please rejoin from the dashboard.</p>
                    <button className="sd-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    if (!roomName || !token) {
        return (
            <div className="live-room-error">
                <div className="error-card">
                    <h2>No Connection Data</h2>
                    <p>Could not join the live class. Missing room details.</p>
                    <button className="sd-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

    return (
        <div className="live-room-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Section */}
            <div className="live-room-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <span className="live-badge">
                            <span className="live-dot"></span> LIVE
                        </span>
                        <h1 className="room-title">{roomName}</h1>
                    </div>
                </div>
            </div>

            {/* Video Container */}
            <div className="livekit-wrapper">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={serverUrl}
                    data-lk-theme="default"
                    style={{ height: '100%', borderRadius: '16px', overflow: 'hidden' }}
                    onDisconnected={() => navigate(-1)}
                >
                    <VideoConference />
                    <RoomAudioRenderer />
                </LiveKitRoom>
            </div>
        </div>
    );
}
