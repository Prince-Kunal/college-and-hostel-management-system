import React, { useState, useEffect } from 'react';

const ScheduleList = () => {
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
                fetch('http://localhost:8000/api/v1/schedules'),
                fetch('http://localhost:8000/api/v1/batches'),
                fetch('http://localhost:8000/api/v1/subjects'),
                fetch('http://localhost:8000/api/v1/admin/users')
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
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f0f8ff', border: '1px solid #cce5ff', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Global Academic Schedules Map</h2>
                {loading && <p style={{ color: '#666' }}>Fetching scheduling datasets arrays cleanly...</p>}
                {error && <p style={{ color: '#dc3545' }}>{error}</p>}

                {!loading && !error && (
                    <>
                        {schedules.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#666' }}>No native schedules are actively maintained right now.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Day</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Time Range</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Batch</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Subject Tuple</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Leading Faculty Operator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{s.day}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{s.startTime} - {s.endTime}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#0d6efd' }}>{batchMap[s.batchId] || s.batchId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{subjectMap[s.subjectId] || s.subjectId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#198754', fontWeight: 'bold' }}>{facultyMap[s.facultyId] || s.facultyId}</td>
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

export default ScheduleList;
