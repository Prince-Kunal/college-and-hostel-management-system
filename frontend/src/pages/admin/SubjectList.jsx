import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SubjectList = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/subjects`);
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to fetch subjects');
            
            setSubjects(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Portal</p>
                    <h1>Subject Directory 📖</h1>
                    <span className="sub">Manage and view all academic subjects</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/subjects/create')} className="sd-btn-primary">+ Create New Subject</button>
                </div>
            </header>

            <div className="sd-card">
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Active Subjects</h3>
                {loading && <p style={{ color: '#64748b' }}>Loading academic subjects...</p>}
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}
                
                {!loading && !error && (
                    <>
                        {subjects.length === 0 ? (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No subjects registered currently.</p>
                        ) : (
                            <div className="sd-class-list">
                                {subjects.map(sub => (
                                    <div key={sub.id} className="sd-class-item" style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                                            {sub.name}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '13px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px' }}>
                                            ID: {sub.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SubjectList;
