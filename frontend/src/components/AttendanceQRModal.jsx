import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

const AttendanceQRModal = ({ scheduleId, isOpen, onClose }) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        let interval;

        const fetchToken = async () => {
            try {
                const res = await api.generateQRToken(scheduleId);
                if (res.success) {
                    setToken(res.token);
                    setError(null);
                }
            } catch (err) {
                setError('Failed to generate QR code');
            }
        };

        if (isOpen && scheduleId) {
            fetchToken(); // Initial fetch
            interval = setInterval(fetchToken, 9000); // Refresh every 9 seconds (before 10s expiry)
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, scheduleId]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: '#fff', padding: '32px', borderRadius: '16px',
                width: '100%', maxWidth: '400px', textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Class Attendance</h2>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>
                    Ask students to scan this QR code. It refreshes automatically.
                </p>

                {error ? (
                    <div style={{ color: '#ef4444', padding: '20px', background: '#fef2f2', borderRadius: '8px' }}>{error}</div>
                ) : token ? (
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'inline-block' }}>
                        <QRCodeSVG value={token} size={250} />
                    </div>
                ) : (
                    <div style={{ padding: '40px', color: '#64748b' }}>Generating QR...</div>
                )}

                <button 
                    onClick={onClose}
                    style={{
                        marginTop: '24px', width: '100%', padding: '12px',
                        background: '#e2e8f0', color: '#475569', border: 'none',
                        borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default AttendanceQRModal;
