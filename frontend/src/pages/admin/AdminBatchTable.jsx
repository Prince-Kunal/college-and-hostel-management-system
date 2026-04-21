import React, { useEffect, useState } from 'react';

const AdminBatchTable = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBatchDetails();
    }, []);

    const fetchBatchDetails = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/admin/batches-details');
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to fetch batch details');
            
            setBatches(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { padding: '2rem', fontFamily: 'sans-serif' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
        th: { textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa', color: '#495057' },
        td: { padding: '1rem', borderBottom: '1px solid #dee2e6', verticalAlign: 'top' },
        badgeInfo: { display: 'inline-block', backgroundColor: '#0dcaf0', color: '#000', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', margin: '0.25rem' },
        badgeSuccess: { display: 'inline-block', backgroundColor: '#198754', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', margin: '0.25rem' },
        sectionTitle: { fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#6c757d' },
    };

    if (loading) return <div style={styles.container}>Loading detailed batches...</div>;
    if (error) return <div style={{...styles.container, color: 'red'}}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={{ marginBottom: '1.5rem', color: '#343a40' }}>Batch Details Overview</h1>
            {batches.length === 0 ? (
                <p>No batches found in the system.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Batch Name</th>
                            <th style={styles.th}>Students ({batches.reduce((acc, b) => acc + b.students.length, 0)} total)</th>
                            <th style={styles.th}>Subject & Faculty Assignments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.map(b => (
                            <tr key={b.batchId}>
                                <td style={{...styles.td, fontWeight: 'bold', color: '#0d6efd', fontSize: '1.1rem'}}>
                                    {b.batchName}
                                </td>
                                <td style={styles.td}>
                                    <div style={styles.sectionTitle}>Count: {b.students.length}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto' }}>
                                        {b.students.length > 0 ? b.students.map(s => (
                                            <span key={s.uid} style={styles.badgeInfo} title={s.email}>
                                                {s.email.split('@')[0]}
                                            </span>
                                        )) : <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>No students enrolled</span>}
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {b.assignments.length > 0 ? b.assignments.map((a, idx) => (
                                            <div key={idx} style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                                <strong>{a.subjectName}</strong> <br/>
                                                <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Faculty: {a.facultyName}</span>
                                            </div>
                                        )) : <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>No assignments yet</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminBatchTable;
