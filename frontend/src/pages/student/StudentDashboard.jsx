import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../services/api';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Auth & Data states
    const [user, setUser] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [classesData, setClassesData] = useState([]);
    
    // Loading & Error states
    const [isStudentLoading, setIsStudentLoading] = useState(true);
    const [isClassesLoading, setIsClassesLoading] = useState(true);
    const [error, setError] = useState(null);

    // Static Data as per requirements
    const staticAttendance = {
        percentage: 82,
        classesAttended: 82,
        totalClasses: 100,
        asOfDate: "April 22, 2026",
        requiredMore: 0
    };

    const staticNotifications = [
        { id: 1, title: "Mid-Term Exam Schedule", desc: "The schedule for mid-term exams has been published.", time: "2 hours ago", emphasized: true },
        { id: 2, title: "Assignment Deadline", desc: "Machine Learning assignment 3 is due tomorrow.", time: "5 hours ago", emphasized: false },
        { id: 3, title: "Class Rescheduled", desc: "Cloud Computing class moved to Lab 3.", time: "1 day ago", emphasized: false }
    ];

    // Helper to parse "HH:MM AM/PM" to Date timestamp
    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        try {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            const now = new Date();
            now.setHours(hours, minutes, 0, 0);
            return now.getTime();
        } catch (e) {
            return 0; // Fallback if parse fails
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setError(null);
                const storedUser = localStorage.getItem('user');
                let parsedUser = null;
                if (storedUser) {
                    parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                }
                
                if (!parsedUser || !parsedUser.uid) {
                    throw new Error("No user UID available globally correctly uniquely.");
                }

                // 1. Fetch Student Data explicitly referencing UID
                setIsStudentLoading(true);
                let studentRes;
                try {
                    studentRes = await api.getStudentProfile(parsedUser.uid);
                } catch (e) {
                    console.warn("API GET /student/:uid failing uniquely safely");
                    throw new Error("Unable to load student data");
                }
                
                setStudentData(studentRes);
                setIsStudentLoading(false);

                // 2. Fetch Classes Data mapping natively intelligently securely referencing UUID!
                setIsClassesLoading(true);
                try {
                    const classesRes = await api.getStudentSchedules(parsedUser.uid);
                    
                    // Process classes
                    const now = Date.now();
                    const processedClasses = classesRes.map(c => ({
                        ...c,
                        startTimestamp: parseTime(c.startTime || c.start) // Backwards compatible with legacy or generic 'start' key
                    }));

                        // Sort by nearest start time first
                        processedClasses.sort((a, b) => a.startTimestamp - b.startTimestamp);

                        // Identify next upcoming class
                        let nextClassIdentified = false;
                        const finalClasses = processedClasses.map(c => {
                            if (!nextClassIdentified && c.startTimestamp > now) {
                                nextClassIdentified = true;
                                const diffMins = Math.floor((c.startTimestamp - now) / 60000);
                                return { ...c, isNext: true, startsIn: diffMins };
                            }
                            return { ...c, isNext: false };
                        });

                        // Max 5 classes
                        setClassesData(finalClasses.slice(0, 5));
                    } catch (e) {
                        throw new Error("Unable to load classes data");
                    } finally {
                        setIsClassesLoading(false);
                    }

            } catch (err) {
                console.error(err);
                setError("Unable to load data");
                setIsStudentLoading(false);
                setIsClassesLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper functions for dynamic styles
    const getAttendanceStatus = (percentage) => {
        if (percentage > 75) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    };

    const attendanceColor = getAttendanceStatus(staticAttendance.percentage);

    // Icons definitions via inline SVG
    const Icons = {
        Scan: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M9 9h6v6H9z" />
            </svg>
        ),
        Home: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        Classes: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
        Learn: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
        Events: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        Hostel: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m8-3v3m-4-3v3" />
            </svg>
        )
    };

    return (
        <>
            {error && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', textAlign: 'center', marginBottom: '16px', borderRadius: '8px', fontWeight: 'bold' }}>
                    {error}
                </div>
            )}
            
            <div className="sd-max-width" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                {/* ---------- TOP HEADER ---------- */}
                <header className="sd-header">
                    <div className="sd-header-left">
                        {isStudentLoading ? (
                            <>
                                <div className="sd-skeleton sd-skeleton-title" style={{ width: '200px' }}></div>
                                <div className="sd-skeleton sd-skeleton-text" style={{ width: '120px' }}></div>
                            </>
                        ) : (
                            <>
                                <h1>{studentData?.name || user?.name || "Student"} 👋</h1>
                                <p><span className="sub">{studentData?.batchName || studentData?.batch || "Unknown Batch"} • {studentData?.semester || "Semester 6"}</span></p>
                            </>
                        )}
                    </div>
                </header>

                {/* ---------- MAIN GRID ---------- */}
                <main className="sd-grid">
                    
                    {/* LEFT COLUMN: UPCOMING CLASSES */}
                    <section className="sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <h2>Upcoming Classes</h2>
                            </div>
                            <div className="sd-card-header-right">
                                <a href="#">View All</a>
                            </div>
                        </div>
                        {isClassesLoading ? (
                            <div className="sd-class-list">
                                {[1, 2, 3].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                            </div>
                        ) : classesData.length === 0 ? (
                            <div className="sd-empty-state">
                                <Icons.Classes />
                                <h3>No Upcoming Classes</h3>
                                <p>You have a free schedule today.</p>
                            </div>
                        ) : (
                            <div className="sd-class-list">
                                {classesData.map((cls, index) => {
                                    const colors = ['purple', 'orange', 'blue', 'green', 'yellow'];
                                    const color = colors[index % colors.length];
                                    
                                    const ClassIcons = [
                                        // Code (Data Structures)
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
                                        // Sigma (Math)
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 7V4H6v4L11 12l-5 4v4h12v-3" /></svg>,
                                        // Monitor (OS)
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
                                        // Database (DBMS)
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
                                        // Brain (AI)
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                                    ];
                                    const CurrentIcon = ClassIcons[index % ClassIcons.length];

                                    return (
                                    <div key={cls.id || index} className={`sd-class-card ${cls.isNext ? 'next' : ''}`}>
                                        
                                        <div className={`sd-class-icon-box ${color}`}>
                                            {CurrentIcon}
                                        </div>

                                        <div className="sd-class-details">
                                            <h3>{cls.subjectName || cls.subject || cls.subjectId}</h3>
                                            <div className="sd-class-meta">
                                                <span>{cls.code || ''} {cls.code ? '•' : ''} {cls.facultyName || cls.faculty || cls.facultyId}</span>
                                            </div>
                                        </div>

                                        <div className="sd-class-time-right">
                                            <strong className={color}>{cls.startTime || cls.start} - {cls.endTime || cls.end}</strong>
                                            <span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                {cls.location || 'Room ' + (300 + index)}
                                            </span>
                                        </div>

                                        {cls.isNext && (
                                            <div className="sd-class-badge">
                                                In {cls.startsIn} mins
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* ATTENDANCE OVERVIEW CARD */}
                        <div className="sd-card">
                            <div className="sd-card-header" style={{ marginBottom: 16 }}>
                                <div className="sd-card-header-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                                    <h2>Attendance Overview</h2>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
                                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0f5ff" strokeWidth="4" strokeDasharray="100, 100" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--sd-primary)" strokeWidth="4" strokeDasharray="80, 100" />
                                    </svg>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1, color: '#0f172a' }}>80%</span>
                                        <span style={{ fontSize: '12px', color: 'var(--sd-text-secondary)', fontWeight: 500, margin: '4px 0 0 0' }}>Overall</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--sd-border)', paddingLeft: '28px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', color: 'var(--sd-text-secondary)', fontWeight: 600 }}>Classes Attended</span>
                                        <div style={{ marginTop: '2px' }}><span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--sd-primary)' }}>80</span> <span style={{ fontSize: '12px', color: 'var(--sd-text-muted)', fontWeight: 500 }}>/ 100</span></div>
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--sd-border)', margin: '4px 0' }}></div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: 'var(--sd-text-secondary)', fontWeight: 600 }}>Total Classes</span>
                                        <div style={{ marginTop: '2px', fontSize: '20px', fontWeight: '700' }}>100</div>
                                    </div>
                                </div>
                            </div>

                            <button className="sd-btn-primary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="3"></circle><path d="M12 17v-1"></path><path d="M12 8V7"></path><path d="M17 12h-1"></path><path d="M8 12H7"></path></svg>
                                Scan to Mark Attendance
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </div>

                        {/* NOTIFICATIONS CARD */}
                        <div className="sd-card">
                            <div className="sd-card-header">
                                <div className="sd-card-header-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                    <h2>Notifications</h2>
                                </div>
                                <div className="sd-card-header-right">
                                    <a href="#">View All</a>
                                </div>
                            </div>
                            
                            <div className="sd-notification-list">
                                <div className="sd-notification-item">
                                    <div className="sd-notif-icon purple">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </div>
                                    <div className="sd-notif-content">
                                        <div className="sd-notif-header">
                                            <h4>Tech Fest 2K25 registrations open!</h4>
                                            <span>10m ago</span>
                                        </div>
                                        <p>Hurry up and register for exciting events.</p>
                                    </div>
                                </div>
                                <div className="sd-notification-item">
                                    <div className="sd-notif-icon yellow">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    </div>
                                    <div className="sd-notif-content">
                                        <div className="sd-notif-header">
                                            <h4>Data Structures assignment due soon</h4>
                                            <span>1h ago</span>
                                        </div>
                                        <p>Topic: Trees and Graphs</p>
                                    </div>
                                </div>
                                <div className="sd-notification-item">
                                    <div className="sd-notif-icon blue">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    </div>
                                    <div className="sd-notif-content">
                                        <div className="sd-notif-header">
                                            <h4>Library will remain closed on 28 May</h4>
                                            <span>3h ago</span>
                                        </div>
                                        <p>Maintenance activity scheduled.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* </div> */}
            
            <div style={{ display: 'none' }}>
                <Outlet />
            </div>
        </>
    );
};

export default StudentDashboard;
