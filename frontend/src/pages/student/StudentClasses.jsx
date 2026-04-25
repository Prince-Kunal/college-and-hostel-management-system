import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const StudentClasses = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };

    useEffect(() => {
        const fetch = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;
            const user = JSON.parse(storedUser);
            try {
                const data = await api.getStudentSchedules(user.uid);
                const sorted = (data || []).sort((a, b) => (dayOrder[a.day] || 8) - (dayOrder[b.day] || 8));
                setClasses(sorted);
            } catch (e) { console.warn('Could not fetch classes'); }
            setLoading(false);
        };
        fetch();
    }, []);

    const colors = ['purple', 'blue', 'orange', 'green', 'yellow'];

    // Group by day
    const grouped = classes.reduce((acc, cls) => {
        const day = cls.day || 'Unscheduled';
        if (!acc[day]) acc[day] = [];
        acc[day].push(cls);
        return acc;
    }, {});

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Student Portal</p>
                    <h1>All Classes 📖</h1>
                    <span className="sub">Your complete weekly schedule</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/student')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Home</button>
                </div>
            </header>

            {loading ? (
                <div className="sd-card">
                    {[1, 2, 3, 4].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="sd-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <h3>No Classes Scheduled</h3>
                    <p>You haven't been assigned to any batch yet.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([day, dayCls]) => (
                    <div key={day} className="sd-card" style={{ marginBottom: '20px' }}>
                        <h3 className="sd-section-title">{day}</h3>
                        <div className="sd-class-list">
                            {dayCls.map((cls, i) => {
                                const color = colors[i % colors.length];
                                return (
                                    <div key={cls.id || i} className="sd-class-card">
                                        <div className={`sd-class-icon-box ${color}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                                        </div>
                                        <div className="sd-class-details">
                                            <h3>{cls.subjectName || cls.subjectId}</h3>
                                            <div className="sd-class-meta">
                                                <span>{cls.facultyName || cls.facultyId} • {cls.location || 'Room TBD'}</span>
                                            </div>
                                        </div>
                                        <div className="sd-class-time-right">
                                            <strong className={color}>{cls.startTime} - {cls.endTime}</strong>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentClasses;
