import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AssignmentList = () => {
    const navigate = useNavigate();
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
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Portal</p>
                    <h1>Faculty Assignments 🔗</h1>
                    <span className="sub">View faculty allocations across batches and subjects</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/assignments/create')} className="sd-btn-primary">+ Map New Faculty</button>
                </div>
            </header>

            <div className="sd-card">
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Faculty Allocation Matrices</h3>
                {loading && <p style={{ color: '#64748b' }}>Aligning matrix dataset structures safely...</p>}
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {assignments.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#64748b' }}>Notice: System matrices currently contain strictly zero tracked faculty assignments inherently.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Target Batch</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Academic Subject</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Faculty Identifier</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Mapping Stamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map(a => (
                                            <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px', color: '#0f172a', fontWeight: '500' }}>{batchMap[a.batchId] || a.batchId}</td>
                                                <td style={{ padding: '16px', color: '#334155' }}>{subjectMap[a.subjectId] || a.subjectId}</td>
                                                <td style={{ padding: '16px', color: '#3b82f6', fontWeight: '500' }}>{facultyMap[a.facultyId] || a.facultyId}</td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignmentList;
