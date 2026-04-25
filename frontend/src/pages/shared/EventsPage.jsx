import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

/**
 * Shared Events Page for both Student and Faculty
 * Filters events based on user role (student/faculty/both)
 */
const EventsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [enrollingId, setEnrollingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;
            const parsed = JSON.parse(storedUser);
            setUser(parsed);

            try {
                const allEvents = await api.getEvents();
                // Filter by audience
                const filtered = (allEvents || []).filter(
                    e => e.audience === 'both' || e.audience === parsed.role
                );
                setEvents(filtered);

                const myEnrolls = await api.getMyEnrollments(parsed.uid);
                setEnrolledIds(new Set((myEnrolls || []).map(e => e.eventId)));
            } catch (e) { console.warn('Could not fetch events'); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleEnroll = async (eventId) => {
        if (!user) return;
        setEnrollingId(eventId);
        try {
            const res = await api.enrollEvent(eventId, { uid: user.uid, email: user.email, role: user.role });
            if (res.success) {
                setEnrolledIds(prev => new Set([...prev, eventId]));
                // Refresh events to get updated counts
                const allEvents = await api.getEvents();
                setEvents((allEvents || []).filter(e => e.audience === 'both' || e.audience === user.role));
            }
            alert(res.message);
        } catch (e) { alert('Enrollment failed'); }
        setEnrollingId(null);
    };

    const homePath = user?.role === 'faculty' ? '/faculty' : '/student';

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Campus Events</p>
                    <h1>Events 🎉</h1>
                    <span className="sub">Browse and enroll in upcoming campus events</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate(homePath)} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Home</button>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="sd-skeleton sd-skeleton-card" style={{ height: '200px' }}></div>)}
                </div>
            ) : events.length === 0 ? (
                <div className="sd-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <h3>No Events Available</h3>
                    <p>Check back later for upcoming campus events.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {events.map(evt => {
                        const isEnrolled = enrolledIds.has(evt.id);
                        const isFull = (evt.enrolledCount || 0) >= evt.capacity;
                        const eventDate = new Date(evt.time);
                        const isPast = eventDate < new Date();

                        return (
                            <div key={evt.id} className="sd-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--sd-text-primary)' }}>{evt.name}</h3>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                            background: evt.audience === 'student' ? '#e0f2fe' : evt.audience === 'faculty' ? '#f3e8ff' : '#dcfce7',
                                            color: evt.audience === 'student' ? '#0284c7' : evt.audience === 'faculty' ? '#9333ea' : '#16a34a'
                                        }}>
                                            {evt.audience === 'both' ? 'Open to All' : evt.audience === 'student' ? 'Students Only' : 'Faculty Only'}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{ fontSize: '14px', color: 'var(--sd-text-secondary)', margin: '0 0 20px 0', lineHeight: '1.6', flex: 1 }}>
                                    {evt.description}
                                </p>

                                {/* Meta */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--sd-text-secondary)', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        {evt.location}
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                                        <span style={{ color: 'var(--sd-text-secondary)' }}>Spots</span>
                                        <span style={{ color: isFull ? '#ef4444' : 'var(--sd-primary)' }}>
                                            {evt.enrolledCount || 0}/{evt.capacity}
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '3px',
                                            width: `${Math.min(100, ((evt.enrolledCount || 0) / evt.capacity) * 100)}%`,
                                            background: isFull ? '#ef4444' : 'var(--sd-primary)',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => handleEnroll(evt.id)}
                                    disabled={isEnrolled || enrollingId === evt.id || isPast}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                                        fontSize: '14px', fontWeight: '700', cursor: isEnrolled || isPast ? 'default' : 'pointer',
                                        background: isEnrolled ? '#dcfce7' : isPast ? '#f1f5f9' : isFull ? '#fef2f2' : 'linear-gradient(135deg, #5c5cff, #7c5cff)',
                                        color: isEnrolled ? '#16a34a' : isPast ? '#94a3b8' : isFull ? '#ef4444' : 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isPast ? 'Event Ended' : isEnrolled ? '✓ Enrolled' : enrollingId === evt.id ? 'Processing...' : isFull ? 'Join Waitlist' : 'Enroll Now'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
