import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const FacultyClasses = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;
            const user = JSON.parse(storedUser);
            try {
                const data = await api.getFacultySchedules(user.uid);
                
                const sorted = (data || []).sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    if (dateA !== dateB) return dateB - dateA; // Descending by date
                    const timeA = a.startTime || '00:00';
                    const timeB = b.startTime || '00:00';
                    return timeB.localeCompare(timeA); // Descending by time
                });
                
                setClasses(sorted);
            } catch (e) { console.warn('Could not fetch faculty classes'); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const colors = ['blue', 'purple', 'orange', 'green', 'yellow'];

    const isClassDone = (dateStr, endTimeStr) => {
        if (!dateStr || !endTimeStr) return false;
        const [year, month, day] = dateStr.split('-');
        let hours = 0, minutes = 0;
        if (endTimeStr.includes(' ')) {
            const [time, modifier] = endTimeStr.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (modifier === 'PM' && h < 12) h += 12;
            if (modifier === 'AM' && h === 12) h = 0;
            hours = h;
            minutes = m;
        } else {
            const [h, m] = endTimeStr.split(':').map(Number);
            hours = h;
            minutes = m;
        }
        const endDateTime = new Date(year, month - 1, day, hours, minutes);
        return new Date() > endDateTime;
    };

    const grouped = classes.reduce((acc, cls) => {
        const dateStr = cls.date ? new Date(cls.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Unscheduled';
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(cls);
        return acc;
    }, {});

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Faculty Portal</p>
                    <h1>Class History 📖</h1>
                    <span className="sub">Your complete teaching schedule according to date</span>
                </div>
                <div className="sd-header-right" style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/faculty/schedules/create')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Schedule Class
                    </button>
                    <button onClick={() => navigate('/faculty')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Home</button>
                </div>
            </header>

            {loading ? (
                <div className="sd-card">
                    {[1, 2, 3].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="sd-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <h3>No Classes Assigned</h3>
                    <p>You haven't been assigned any classes yet.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([dateLabel, dayCls]) => (
                    <div key={dateLabel} className="sd-card" style={{ marginBottom: '20px' }}>
                        <h3 className="sd-section-title">{dateLabel}</h3>
                        <div className="sd-class-list">
                            {dayCls.map((cls, i) => {
                                const color = colors[i % colors.length];
                                const done = isClassDone(cls.date, cls.endTime);
                                return (
                                    <div key={cls.id || i} className="sd-class-card" style={{ opacity: done ? 0.6 : 1 }}>
                                        <div className={`sd-class-icon-box ${color}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                        </div>
                                        <div className="sd-class-details">
                                            <h3>{cls.subjectName || cls.subjectId}</h3>
                                            <div className="sd-class-meta">
                                                <span>{cls.day} • {cls.location || 'Room TBD'}</span>
                                            </div>
                                        </div>
                                        <div className="sd-class-time-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <strong className={color}>{cls.startTime} - {cls.endTime}</strong>
                                            {done ? (
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '12px' }}>Done</span>
                                            ) : (
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px' }}>Upcoming</span>
                                            )}
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

export default FacultyClasses;
