import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import QRScannerModal from '../../components/QRScannerModal';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [classesData, setClassesData] = useState([]);
    const [events, setEvents] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [enrollingId, setEnrollingId] = useState(null);
    const [joiningId, setJoiningId] = useState(null);
    const [attendanceData, setAttendanceData] = useState({ percentage: 0, attended: 0, total: 0 });
    const [scannerOpen, setScannerOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [isStudentLoading, setIsStudentLoading] = useState(true);
    const [isClassesLoading, setIsClassesLoading] = useState(true);
    const [error, setError] = useState(null);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];

    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        try {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            const d = new Date(); d.setHours(hours, minutes, 0, 0);
            return d.getTime();
        } catch (e) { return 0; }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setError(null);
                const storedUser = localStorage.getItem('user');
                let parsedUser = null;
                if (storedUser) { parsedUser = JSON.parse(storedUser); setUser(parsedUser); }
                if (!parsedUser || !parsedUser.uid) { throw new Error("No user data found"); }

                // Student profile
                setIsStudentLoading(true);
                try {
                    const studentRes = await api.getStudentProfile(parsedUser.uid);
                    setStudentData(studentRes);
                } catch (e) { console.warn("Could not fetch student profile"); }
                setIsStudentLoading(false);

                // Fetch attendance
                try {
                    const att = await api.getStudentAttendance(parsedUser.uid);
                    setAttendanceData({
                        percentage: att.percentage || 0,
                        attended: att.attended || 0,
                        total: att.total || 0
                    });
                } catch (e) { console.error('Failed to fetch attendance'); }

                // Fetch notifications count
                try {
                    const notifs = await api.getNotifications(parsedUser.uid);
                    setUnreadCount(notifs.filter(n => !n.isRead).length);
                } catch (e) { console.warn('Failed to fetch notifications count'); }

                // Schedules — filter to today's ongoing + upcoming only
                setIsClassesLoading(true);
                try {
                    const classesRes = await api.getStudentSchedules(parsedUser.uid);
                    const now = Date.now();
                    const todayClasses = (classesRes || [])
                        .filter(c => c.day === todayName || !c.day)
                        .map(c => ({
                            ...c,
                            startTimestamp: parseTime(c.startTime),
                            endTimestamp: parseTime(c.endTime)
                        }))
                        .filter(c => c.endTimestamp > now)
                        .sort((a, b) => a.startTimestamp - b.startTimestamp)
                        .map((c, idx, arr) => {
                            const isOngoing = c.startTimestamp <= now && c.endTimestamp > now;
                            const isNext = !isOngoing && idx === 0 || (idx > 0 && arr[idx - 1].startTimestamp <= now);
                            const startsIn = Math.floor((c.startTimestamp - now) / 60000);
                            return { ...c, isOngoing, isNext: !isOngoing && startsIn > 0, startsIn: Math.max(0, startsIn) };
                        });
                    setClassesData(todayClasses);
                } catch (e) { console.warn("Could not fetch schedules"); }
                setIsClassesLoading(false);

                // Events
                try {
                    const allEvents = await api.getEvents();
                    setEvents((allEvents || []).filter(e => e.audience === 'student' || e.audience === 'both'));
                    const myEnrolls = await api.getMyEnrollments(parsedUser.uid);
                    setEnrolledIds(new Set((myEnrolls || []).map(e => e.eventId)));
                } catch (e) { console.warn("Could not fetch events"); }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchDashboardData();
    }, []);

    const handleLogout = () => { localStorage.removeItem('user'); navigate('/login', { replace: true }); };

    const handleJoinLive = async (scheduleId) => {
        if (!user?.uid) return;
        setJoiningId(scheduleId);
        try {
            const res = await api.joinLiveClass(scheduleId, user.uid);
            localStorage.setItem('livekit', JSON.stringify({ roomName: res.roomName, token: res.token }));
            navigate('/live-room', { state: { roomName: res.roomName, token: res.token } });
        } catch (e) { alert('No live class active for this schedule right now.'); }
        setJoiningId(null);
    };

    const handleEnroll = async (eventId) => {
        if (!user) return;
        setEnrollingId(eventId);
        try {
            const res = await api.enrollEvent(eventId, { uid: user.uid, email: user.email, role: user.role });
            if (res.success) { setEnrolledIds(prev => new Set([...prev, eventId])); }
            alert(res.message);
        } catch (e) { alert('Enrollment failed'); }
        setEnrollingId(null);
    };

    const colors = ['purple', 'blue', 'orange', 'green', 'yellow'];

    // If on sub-route (like /student/schedule), render Outlet only
    if (location.pathname !== '/student') {
        return <Outlet />;
    }

    if (error) {
        return (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--sd-text-secondary)' }}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="sd-btn-primary" style={{ maxWidth: '200px', margin: '16px auto' }}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>{studentData?.batchName || 'Student Portal'}</p>
                    <h1>
                        {isStudentLoading ? <span className="sd-skeleton sd-skeleton-title"></span> : (
                            <>Hi, {studentData?.name || user?.email?.split('@')[0] || 'Student'}! 👋</>
                        )}
                    </h1>
                    {studentData?.semester && <span className="sub">{studentData.semester}</span>}
                </div>
                <div className="sd-header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate('/student/notifications')} 
                        style={{ background: 'var(--sd-card-bg)', border: '1px solid var(--sd-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: 'var(--sd-text-secondary)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: '0', right: '0', background: 'var(--sd-danger)', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <button onClick={handleLogout} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-danger)', border: '1px solid var(--sd-border)' }}>Logout</button>
                </div>
            </header>

            <main className="sd-grid">
                {/* Left Column */}
                <div>
                    {/* Today's Classes */}
                    <div className="sd-card" style={{ marginBottom: '24px' }}>
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <h2>Today's Classes</h2>
                            </div>
                            <div className="sd-card-header-right">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/classes'); }}>View All</a>
                            </div>
                        </div>

                        {isClassesLoading ? (
                            <div className="sd-class-list">
                                {[1, 2, 3].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                            </div>
                        ) : classesData.length === 0 ? (
                            <div className="sd-empty-state">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <h3>No More Classes Today</h3>
                                <p>All classes for today are done. Enjoy the rest of your day!</p>
                            </div>
                        ) : (
                            <div className="sd-class-list">
                                {classesData.map((cls, index) => {
                                    const color = colors[index % colors.length];
                                    return (
                                        <div key={cls.id || index} className={`sd-class-card ${cls.isOngoing ? 'next' : ''}`}>
                                            <div className={`sd-class-icon-box ${color}`}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                                            </div>
                                            <div className="sd-class-details">
                                                <h3>{cls.subjectName || 'Unknown Subject'}</h3>
                                                <div className="sd-class-meta">
                                                    <span>{cls.facultyName || cls.facultyId} • {cls.location || 'Room TBD'}</span>
                                                </div>
                                            </div>
                                            <div className="sd-class-time-right">
                                                <strong className={color}>{cls.startTime} - {cls.endTime}</strong>
                                                {cls.isOngoing ? (
                                                    <button
                                                        onClick={() => handleJoinLive(cls.id)}
                                                        disabled={joiningId === cls.id}
                                                        style={{
                                                            padding: '6px 14px', borderRadius: '10px', border: 'none',
                                                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                            color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                        {joiningId === cls.id ? 'Joining...' : 'Join Live'}
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: 'var(--sd-text-muted)', fontWeight: '600' }}>
                                                        In {cls.startsIn > 60 ? `${Math.floor(cls.startsIn / 60)}h ${cls.startsIn % 60}m` : `${cls.startsIn} mins`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Attendance */}
                    <div className="sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                <h2>Attendance</h2>
                            </div>
                            <div className="sd-card-header-right">
                                <button 
                                    onClick={() => setScannerOpen(true)}
                                    style={{ padding: '6px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
                                    Scan QR
                                </button>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--sd-success)" strokeWidth="10" strokeLinecap="round"
                                        strokeDasharray={`${attendanceData.percentage * 3.14} ${(100 - attendanceData.percentage) * 3.14}`}
                                        strokeDashoffset="0" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
                                    <text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--sd-text-primary)">{attendanceData.percentage}%</text>
                                    <text x="60" y="74" textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--sd-text-secondary)">Attendance</text>
                                </svg>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--sd-text-secondary)', marginTop: '12px', fontWeight: '500' }}>
                                {attendanceData.attended}/{attendanceData.total} classes attended
                            </p>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <h2>Events</h2>
                            </div>
                            <div className="sd-card-header-right">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/events'); }}>See All</a>
                            </div>
                        </div>
                        {events.length === 0 ? (
                            <p style={{ color: 'var(--sd-text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>No events available.</p>
                        ) : (
                            <div className="sd-notification-list">
                                {events.slice(0, 3).map(evt => (
                                    <div key={evt.id} className="sd-notification-item" style={{ alignItems: 'center' }}>
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
                </div>
            </main>
            <QRScannerModal 
                isOpen={scannerOpen} 
                onClose={() => {
                    setScannerOpen(false);
                    // Refetch attendance to update dashboard after scanning
                    if (user) {
                        api.getStudentAttendance(user.uid).then(att => {
                            setAttendanceData({
                                percentage: att.percentage || 0,
                                attended: att.attended || 0,
                                total: att.total || 0
                            });
                        }).catch(() => {});
                    }
                }} 
                studentId={user?.uid} 
            />
        </div>
    );
};

export default StudentDashboard;
