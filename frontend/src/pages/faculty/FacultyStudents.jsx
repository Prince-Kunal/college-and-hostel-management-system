import React, { useEffect, useState } from 'react';

const FacultyStudents = () => {
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
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/faculty/my-students/${facultyId}`);
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to fetch your students');
            
            setGroupedStudents(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { padding: '2rem', fontFamily: 'sans-serif' },
        card: { padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        header: { color: '#0d6efd', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1rem' },
        list: { listStyleType: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' },
        listItem: { padding: '0.75rem 1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '4px solid #198754', display: 'flex', alignItems: 'center' },
        studentIcon: { marginRight: '10px', color: '#6c757d' }
    };

    if (loading) return <div style={styles.container}>Loading your mapped students...</div>;
    if (error) return <div style={{...styles.container, color: 'red'}}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={{ marginBottom: '2rem', color: '#343a40' }}>My Students</h1>
            
            {groupedStudents.length === 0 ? (
                <div style={styles.card}>
                    <p style={{ color: '#6c757d', fontStyle: 'italic', margin: 0 }}>You currently do not have any students assigned to your batches.</p>
                </div>
            ) : (
                groupedStudents.map(group => (
                    <div key={group.batchId} style={styles.card}>
                        <h2 style={styles.header}>
                            Batch: {group.batchName} 
                            <span style={{ fontSize: '1rem', color: '#6c757d', fontWeight: 'normal', marginLeft: '1rem' }}>
                                ({group.students.length} students)
                            </span>
                        </h2>
                        
                        {group.students.length === 0 ? (
                            <p style={{ color: '#adb5bd', fontStyle: 'italic' }}>No students found in this batch.</p>
                        ) : (
                            <ul style={styles.list}>
                                {group.students.map(s => (
                                    <li key={s.uid} style={styles.listItem}>
                                        <span style={styles.studentIcon}>👤</span>
                                        <span style={{ fontWeight: '500' }}>{s.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default FacultyStudents;
