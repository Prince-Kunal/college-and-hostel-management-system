import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ScheduleList = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    
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
            const [resSched, resBatches, resSubjects, resUsers] = await Promise.all([
                fetch(`http://${window.location.hostname}:8000/api/v1/schedules`),
                fetch(`http://${window.location.hostname}:8000/api/v1/batches`),
                fetch(`http://${window.location.hostname}:8000/api/v1/subjects`),
                fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`)
            ]);
            
            const dataSched = await resSched.json();
            const dataBatches = await resBatches.json();
            const dataSubjects = await resSubjects.json();
            const dataUsers = await resUsers.json();
            
            if (!resSched.ok) throw new Error(dataSched.message || 'Error pulling schedules tuples strictly missing node targets');

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

            setSchedules(dataSched.data);
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
                    <h1>Schedules 🗓️</h1>
                    <span className="sub">View and manage all class schedules</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/schedules/create')} className="sd-btn-primary">+ Add Schedule</button>
                </div>
            </header>

            <div className="sd-card">
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Global Academic Schedules Map</h3>
                {loading && <p style={{ color: '#64748b' }}>Fetching scheduling datasets...</p>}
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {schedules.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#64748b' }}>No native schedules are actively maintained right now.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Day</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Time Range</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Batch</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Subject Tuple</th>
                                            <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>Leading Faculty Operator</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px', color: '#0f172a', fontWeight: '600' }}>{s.day}</td>
                                                <td style={{ padding: '16px', color: '#334155' }}>{s.startTime} - {s.endTime}</td>
                                                <td style={{ padding: '16px', color: '#3b82f6', fontWeight: '500' }}>{batchMap[s.batchId] || s.batchId}</td>
                                                <td style={{ padding: '16px', color: '#334155' }}>{subjectMap[s.subjectId] || s.subjectId}</td>
                                                <td style={{ padding: '16px', color: '#10b981', fontWeight: '500' }}>{facultyMap[s.facultyId] || s.facultyId}</td>
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

export default ScheduleList;
