import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingLive, setStartingLive] = useState(null);
    const [events, setEvents] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [enrollingId, setEnrollingId] = useState(null);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];

    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        try {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            const d = new Date();
            d.setHours(hours, minutes, 0, 0);
            return d.getTime();
        } catch (e) { return 0; }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        let parsedUser = null;
        if (storedUser) {
            parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }

        const fetchData = async () => {
            if (!parsedUser?.uid) return;
            try {
                const data = await api.getFacultySchedules(parsedUser.uid);
                // Filter to today's ongoing + upcoming
                const now = Date.now();
                const todayClasses = (data || [])
                    .filter(s => s.day === todayName)
                    .map(s => ({ ...s, endTimestamp: parseTime(s.endTime), startTimestamp: parseTime(s.startTime) }))
                    .filter(s => s.endTimestamp > now)
                    .sort((a, b) => a.startTimestamp - b.startTimestamp);
                setSchedules(todayClasses);
            } catch (e) {
                console.warn('Could not fetch faculty schedules:', e.message);
            }
            // Fetch events
            try {
                const allEvents = await api.getEvents();
                setEvents((allEvents || []).filter(e => e.audience === 'faculty' || e.audience === 'both'));
                const myEnrolls = await api.getMyEnrollments(parsedUser.uid);
                setEnrolledIds(new Set((myEnrolls || []).map(e => e.eventId)));
            } catch (e) { console.warn('Could not fetch events'); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleStartLive = async (scheduleId) => {
        if (!user?.uid) return;
        setStartingLive(scheduleId);
        try {
            const res = await api.startLiveClass(scheduleId, user.uid);
            localStorage.setItem('livekit', JSON.stringify({ roomName: res.roomName, token: res.token }));
            navigate('/live-room', { state: { roomName: res.roomName, token: res.token } });
        } catch (e) {
            alert('Failed to start live class: ' + e.message);
        }
        setStartingLive(null);
    };

    const handleEnroll = async (eventId) => {
        if (!user) return;
        setEnrollingId(eventId);
        try {
            const res = await api.enrollEvent(eventId, { uid: user.uid, email: user.email, role: user.role });
            if (res.success) {
                setEnrolledIds(prev => new Set([...prev, eventId]));
            }
            alert(res.message);
        } catch (e) { alert('Enrollment failed'); }
        setEnrollingId(null);
    };

    const colors = ['blue', 'purple', 'orange', 'green', 'yellow'];

    return (
        <React.Fragment>
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <header className="sd-header">
                    <div className="sd-header-left">
                        <p>Faculty Portal</p>
                        <h1>Welcome, {user?.name || user?.email || "Professor"}! 📚</h1>
                        <span className="sub">Department of Computer Science</span>
                    </div>
                    <div className="sd-header-right">
                        <button onClick={handleLogout} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-danger)', border: '1px solid var(--sd-border)' }}>Logout</button>
                    </div>
                </header>

                <main className="sd-grid">
                    <section className="sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <h2>Today's Classes</h2>
                            </div>
                            <div className="sd-card-header-right">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/faculty/classes'); }}>View All</a>
                            </div>
                        </div>

                        {loading ? (
                            <div className="sd-class-list">
                                {[1, 2].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="sd-empty-state">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <h3>No More Classes Today</h3>
                                <p>All classes for today are complete. Enjoy your evening!</p>
                            </div>
                        ) : (
                            <div className="sd-class-list">
                                {schedules.map((cls, index) => {
                                    const color = colors[index % colors.length];
                                    const now = Date.now();
                                    const isOngoing = cls.startTimestamp <= now && cls.endTimestamp > now;
                                    return (
                                        <div key={cls.id || index} className={`sd-class-card ${isOngoing ? 'next' : ''}`}>
                                            <div className={`sd-class-icon-box ${color}`}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                            </div>
                                            <div className="sd-class-details">
                                                <h3>{cls.subjectName || cls.subjectId}</h3>
                                                <div className="sd-class-meta">
                                                    <span>{cls.day} • {cls.location || 'Room TBD'}</span>
                                                </div>
                                            </div>
                                            <div className="sd-class-time-right">
                                                <strong className={color}>{cls.startTime} - {cls.endTime}</strong>
                                                <button
                                                    onClick={() => handleStartLive(cls.id)}
                                                    disabled={startingLive === cls.id}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: '10px', border: 'none',
                                                        background: isOngoing ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #5c5cff, #7c5cff)',
                                                        color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                    {startingLive === cls.id ? 'Starting...' : isOngoing ? 'Live Now' : 'Go Live'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Events Card */}
                        <div className="sd-card">
                            <div className="sd-card-header">
                                <div className="sd-card-header-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    <h2>Upcoming Events</h2>
                                </div>
                            </div>
                            {events.length === 0 ? (
                                <p style={{ color: 'var(--sd-text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>No events available.</p>
                            ) : (
                                <div className="sd-notification-list">
                                    {events.slice(0, 3).map(evt => (
                                        <div key={evt.id} className="sd-notification-item">
                                            <div className="sd-notif-icon purple">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            </div>
                                            <div className="sd-notif-content" style={{ flex: 1 }}>
                                                <div className="sd-notif-header">
                                                    <h4>{evt.name}</h4>
                                                    <span>{evt.enrolledCount || 0}/{evt.capacity}</span>
                                                </div>
                                                <p>{evt.location} • {new Date(evt.time).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleEnroll(evt.id)}
                                                disabled={enrolledIds.has(evt.id) || enrollingId === evt.id}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '10px', border: 'none', flexShrink: 0,
                                                    background: enrolledIds.has(evt.id) ? '#dcfce7' : '#f0f0ff',
                                                    color: enrolledIds.has(evt.id) ? '#16a34a' : '#5c5cff',
                                                    fontSize: '12px', fontWeight: '700', cursor: enrolledIds.has(evt.id) ? 'default' : 'pointer'
                                                }}
                                            >
                                                {enrolledIds.has(evt.id) ? 'Enrolled ✓' : (evt.enrolledCount >= evt.capacity ? 'Waitlist' : 'Enroll')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="sd-card">
                            <div className="sd-card-header" style={{ marginBottom: 16 }}>
                                <div className="sd-card-header-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                    <h2>Actions</h2>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                <button onClick={() => navigate('/faculty/students')} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>
                                    View Student Directory
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </React.Fragment>
    );
};

export default FacultyDashboard;
