import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';

const QRScannerModal = ({ isOpen, onClose, studentId }) => {
    const [status, setStatus] = useState('scanning'); // scanning, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(async (decodedText) => {
            // Stop scanning once we get a result
            scanner.pause(true);
            setStatus('processing');
            
            try {
                const res = await api.markAttendance(decodedText, studentId);
                if (res.success) {
                    setStatus('success');
                    setMessage('Attendance marked successfully!');
                    setTimeout(() => {
                        scanner.clear();
                        onClose();
                    }, 2000);
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Failed to mark attendance');
                setTimeout(() => {
                    setStatus('scanning');
                    scanner.resume();
                }, 3000);
            }
        }, (error) => {
            // Ignore scan failures (happens continuously until QR is found)
        });

        return () => {
            scanner.clear().catch(console.error);
        };
    }, [isOpen, studentId, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: '#fff', padding: '24px', borderRadius: '16px',
                width: '100%', maxWidth: '400px', textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Scan QR Code</h2>
                
                {status === 'success' ? (
                    <div style={{ padding: '40px 20px', color: '#16a34a', background: '#f0fdf4', borderRadius: '12px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <h3 style={{ margin: 0 }}>{message}</h3>
                    </div>
                ) : (
                    <>
                        <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                        {status === 'error' && (
                            <div style={{ marginTop: '16px', color: '#ef4444', padding: '12px', background: '#fef2f2', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
                                {message}
                            </div>
                        )}
                        {status === 'processing' && (
                            <div style={{ marginTop: '16px', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                                Processing attendance...
                            </div>
                        )}
                    </>
                )}

                <button 
                    onClick={onClose}
                    style={{
                        marginTop: '24px', width: '100%', padding: '12px',
                        background: '#e2e8f0', color: '#475569', border: 'none',
                        borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default QRScannerModal;
