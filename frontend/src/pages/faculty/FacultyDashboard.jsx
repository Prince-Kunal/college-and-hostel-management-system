import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        upcomingAssignments: 0
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        // Mock data fetch for faculty stats
        setTimeout(() => {
            setStats({
                totalClasses: 4,
                totalStudents: 120,
                upcomingAssignments: 2
            });
        }, 800);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

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
                                <h2>Today's Schedule</h2>
                            </div>
                            <div className="sd-card-header-right">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/faculty/schedule'); }}>View Calendar</a>
                            </div>
                        </div>

                        <div className="sd-class-list">
                            <div className="sd-class-card next">
                                <div className="sd-class-icon-box blue">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                </div>
                                <div className="sd-class-details">
                                    <h3>CS-301 Data Structures</h3>
                                    <div className="sd-class-meta">
                                        <span>Batch 2026-A • Lab 3</span>
                                    </div>
                                </div>
                                <div className="sd-class-time-right">
                                    <strong className="blue">10:00 AM - 11:30 AM</strong>
                                    <span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        Lab 3
                                    </span>
                                </div>
                                <div className="sd-class-badge">In 15 mins</div>
                            </div>
                            <div className="sd-class-card">
                                <div className="sd-class-icon-box purple">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 7V4H6v4L11 12l-5 4v4h12v-3" /></svg>
                                </div>
                                <div className="sd-class-details">
                                    <h3>MA-201 Discrete Math</h3>
                                    <div className="sd-class-meta">
                                        <span>Batch 2026-B • Room 402</span>
                                    </div>
                                </div>
                                <div className="sd-class-time-right">
                                    <strong className="purple">01:00 PM - 02:30 PM</strong>
                                    <span>Room 402</span>
                                </div>
                            </div>
                        </div>

                        <button className="sd-btn-primary" style={{ marginTop: '24px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                            Start Live Classroom
                        </button>
                    </section>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="sd-card">
                            <div className="sd-card-header" style={{ marginBottom: 16 }}>
                                <div className="sd-card-header-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <h2>Actions</h2>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                <button className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>
                                    Publish Assignment
                                </button>
                                <button className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>
                                    Upload Grades
                                </button>
                                <button onClick={() => navigate('/faculty/students')} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>
                                    View Student Directory
                                </button>
                            </div>
                        </div>

                        <div className="sd-card">
                            <div className="sd-card-header">
                                <div className="sd-card-header-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    <h2>Pending Approvals</h2>
                                </div>
                            </div>
                            
                            <div className="sd-notification-list">
                                <div className="sd-notification-item">
                                    <div className="sd-notif-icon yellow">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </div>
                                    <div className="sd-notif-content">
                                        <div className="sd-notif-header">
                                            <h4>Review Project Proposals</h4>
                                            <span>Batch 2026</span>
                                        </div>
                                        <p>12 submissions waiting for review.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </React.Fragment>
    );
};

export default FacultyDashboard;
