import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const data = await api.getNotifications(user.uid);
                setNotifications(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch notifications');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.markNotificationRead(id, user.uid);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    if (!user) return <p>Please login first.</p>;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Updates & Alerts</p>
                    <h1>Notifications 🔔</h1>
                    <span className="sub">You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
                </div>
            </header>

            {error && (
                <div style={{ padding: '20px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '24px' }}>
                    {error}
                </div>
            )}

            <div className="sd-card">
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => <div key={i} className="sd-skeleton sd-skeleton-card" style={{ height: '80px' }}></div>)}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="sd-empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <h3>No Notifications Yet</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                style={{
                                    padding: '20px', 
                                    borderRadius: '12px', 
                                    border: `1px solid ${notif.isRead ? 'var(--sd-border)' : '#cbd5e1'}`,
                                    background: notif.isRead ? 'var(--sd-bg)' : '#f8fafc',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}
                            >
                                {!notif.isRead && (
                                    <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '24px', left: '12px' }}></div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: notif.isRead ? '0' : '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', color: notif.isRead ? 'var(--sd-text-secondary)' : 'var(--sd-text-primary)' }}>
                                        {notif.title}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--sd-text-secondary)', paddingLeft: notif.isRead ? '0' : '12px', lineHeight: '1.5' }}>
                                    {notif.message}
                                </p>
                                
                                {!notif.isRead && (
                                    <div style={{ paddingLeft: '12px', marginTop: '8px' }}>
                                        <button 
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            style={{
                                                background: 'transparent', border: 'none', color: 'var(--sd-primary)', 
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0
                                            }}
                                        >
                                            Mark as read
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
