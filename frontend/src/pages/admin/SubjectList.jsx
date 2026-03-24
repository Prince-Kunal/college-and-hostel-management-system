import React, { useState, useEffect } from 'react';

const SubjectList = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/subjects');
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
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Subject Directory</h2>
                {loading && <p style={{ color: '#666' }}>Loading academic subjects...</p>}
                {error && <p style={{ color: '#dc3545' }}>{error}</p>}
                
                {!loading && !error && (
                    <>
                        {subjects.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>No subjects registered currently.</p>
                        ) : (
                            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', margin: 0 }}>
                                {subjects.map(sub => (
                                    <li key={sub.id} style={{ marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '1.1rem' }}>{sub.name}</strong> 
                                        <span style={{ color: '#6c757d', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                            (ID: {sub.id})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SubjectList;
