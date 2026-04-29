import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL;


const FacultyStudents = () => {
    const navigate = useNavigate();
    const [groupedStudents, setGroupedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const facultyId = parsed.id || parsed.uid;
            if (facultyId) {
                fetchMyStudents(facultyId);
            } else {
                setError("Faculty ID not found in session");
                setLoading(false);
            }
        }
    }, []);

    const fetchMyStudents = async (facultyId) => {
        try {
            const res = await fetch(`${API}/faculty/my-students/${facultyId}`);
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to fetch your students');
            
            setGroupedStudents(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const colors = ['blue', 'purple', 'orange', 'green', 'yellow'];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Faculty Portal</p>
                    <h1>My Students 👨‍🎓</h1>
                    <span className="sub">Directory of all students in your assigned batches</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/faculty')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Back</button>
                </div>
            </header>

            {loading ? (
                <div className="sd-grid">
                    {[1, 2].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                </div>
            ) : error ? (
                <div className="sd-card" style={{ color: 'var(--sd-danger)', textAlign: 'center', padding: '24px' }}>
                    Error: {error}
                </div>
            ) : groupedStudents.length === 0 ? (
                <div className="sd-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <h3>No Students Assigned</h3>
                    <p>You currently do not have any students assigned to your batches.</p>
                </div>
            ) : (
                <div className="sd-grid">
                    {groupedStudents.map((group, idx) => (
                        <div key={group.batchId} className="sd-card">
                            <h3 className="sd-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Batch: {group.batchName} 
                                <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                    {group.students.length} students
                                </span>
                            </h3>
                            
                            {group.students.length === 0 ? (
                                <p style={{ color: 'var(--sd-text-secondary)', fontStyle: 'italic', fontSize: '14px', marginTop: '16px' }}>No students found in this batch.</p>
                            ) : (
                                <div className="sd-class-list" style={{ marginTop: '16px' }}>
                                    {group.students.map((s, i) => {
                                        const color = colors[idx % colors.length];
                                        return (
                                            <div key={s.uid} className="sd-class-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                                <div className={`sd-class-icon-box ${color}`} style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                </div>
                                                <div className="sd-class-details" style={{ overflow: 'hidden' }}>
                                                    <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</h4>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultyStudents;
