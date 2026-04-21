import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    VideoConference
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function VideoRoom() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // const { roomName, token } = location.state || {};
    const state = location.state;
    const stored = JSON.parse(localStorage.getItem("livekit") || "{}");

    const roomName = state?.roomName || stored.roomName;
    const rawToken = state?.token || stored.token;
    
    const token = typeof rawToken === "string"
        ? rawToken
        : rawToken?.token;

    if (typeof token !== "string") {
        console.error("INVALID TOKEN:", token);
        return <div>Invalid token format</div>;
    }

    console.log("TOKEN VALUE:", token);
    console.log("TOKEN TYPE:", typeof token);

    if (!roomName || !token) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2>No Connection Data</h2>
                <p>Could not join the live class. Missing roomName or token.</p>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

    return (
        <div style={{ height: 'calc(100vh - 80px)', width: '100%', background: '#000' }}>
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                style={{ height: '100%' }}
                onDisconnected={() => console.log("Disconnected")}
            >
                <VideoConference />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}
