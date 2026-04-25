import React, { useState, useEffect } from 'react';

const AssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    
    // Key/Value Lookups resolving native Firestore ID hashes instantly
    const [batchMap, setBatchMap] = useState({});
    const [subjectMap, setSubjectMap] = useState({});
    const [facultyMap, setFacultyMap] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resAssign, resBatches, resSubjects, resUsers] = await Promise.all([
                fetch(`http://${window.location.hostname}:8000/api/v1/faculty-assignments`),
                fetch(`http://${window.location.hostname}:8000/api/v1/batches`),
                fetch(`http://${window.location.hostname}:8000/api/v1/subjects`),
                fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`)
            ]);
            
            const dataAssign = await resAssign.json();
            const dataBatches = await resBatches.json();
            const dataSubjects = await resSubjects.json();
            const dataUsers = await resUsers.json();
            
            if (!resAssign.ok) throw new Error(dataAssign.message || 'Error tracking live assignments');

            // Intelligently assemble mappings bridging Firestore IDs natively rendering clear strings
            const bMap = {};
            if (dataBatches.success) dataBatches.data.forEach(b => bMap[b.id] = b.name);
            setBatchMap(bMap);

            const sMap = {};
            if (dataSubjects.success) dataSubjects.data.forEach(s => sMap[s.id] = s.name);
            setSubjectMap(sMap);

            const fMap = {};
            if (dataUsers.success) dataUsers.data.forEach(u => fMap[u.id] = u.email);
            setFacultyMap(fMap);

            setAssignments(dataAssign.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Faculty Allocation Matrices</h2>
                {loading && <p style={{ color: '#666' }}>Aligning matrix dataset structures safely...</p>}
                {error && <p style={{ color: '#dc3545' }}>{error}</p>}

                {!loading && !error && (
                    <>
                        {assignments.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#666' }}>Notice: System matrices currently contain strictly zero tracked faculty assignments inherently.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Target Batch</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Academic Subject</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Faculty Identifier</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Mapping Stamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map(a => (
                                        <tr key={a.id}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{batchMap[a.batchId] || a.batchId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{subjectMap[a.subjectId] || a.subjectId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#0d6efd', fontWeight: 'bold' }}>{facultyMap[a.facultyId] || a.facultyId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#6c757d', fontSize: '0.85rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignmentList;
