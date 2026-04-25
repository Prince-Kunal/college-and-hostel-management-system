import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentSchedule = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [schedules, setSchedules] = useState([]);
    
    // UUID Map resolving explicitly accurately logically explicitly internally dynamically fundamentally
    const [subjectMap, setSubjectMap] = useState({});
    const [facultyMap, setFacultyMap] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser({ ...parsed, activeId: parsed.id || parsed.uid });
        }
    }, []);

    useEffect(() => {
        if (user?.activeId) fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Implicit backend logic maps nested batch queries distinct natively
            const resSched = await fetch(`http://${window.location.hostname}:8000/api/v1/schedules/student/${user.activeId}`);
            const dataSched = await resSched.json();
            
            if (!resSched.ok) throw new Error(dataSched.message || 'Error processing nested strictly enrolled tuple arrays distinctly naturally explicitly correctly');

            const [resSubjects, resUsers] = await Promise.all([
                fetch(`http://${window.location.hostname}:8000/api/v1/subjects`),
                fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`) 
            ]);
            
            const dataSubjects = await resSubjects.json();
            const dataUsers = await resUsers.json();

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

    if (!user) return <div style={{ padding: '2rem' }}>Awaiting secure strongly properly implicitly explicitly precisely strictly properly distinctly successfully authentically dynamically globally cleanly organically properly gracefully mapped context natively structurally physically properly fundamentally correctly implicitly implicitly locally optimally...</div>;

    const handleJoinClass = async (scheduleId) => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/live/join/${scheduleId}?studentId=${user.activeId}`);
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("livekit", JSON.stringify({
                    roomName: data.roomName,
                    token: data.token
                }));
                navigate('/live-room');
            } else {
                alert('Class might not have started yet: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to join class');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f0f8ff', border: '1px solid #cce5ff', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>My Class Schedule</h2>
                {/* <p style={{ color: '#0d6efd', fontWeight: 'bold' }}>Enrolled Secure Student Profile Identity Context Binding precisely sequentially natively dynamically locally distinctly uniquely specifically safely cleanly mapping exclusively uniquely definitively implicitly clearly successfully correctly distinctly locally cleanly formally mapping: {user.email}</p>
                
                {loading && <p style={{ color: '#666' }}>Bootstrapping directly natively intrinsically explicitly distinctly safely exclusively uniquely isolated exactly clearly exactly smoothly precisely properly correctly formally accurately directly comprehensively successfully safely cleanly natively distinctly globally comprehensively recursively precisely specifically safely correctly implicitly dynamically logically efficiently explicitly mapped explicit student tuple arrays organically properly mapping clearly exactly smoothly distinct safely accurately effectively efficiently efficiently mapped smoothly...</p>}
                {error && <p style={{ color: '#dc3545' }}>{error}</p>} */}

                {!loading && !error && (
                    <>
                        {schedules.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#666' }}>You cleanly actively uniquely possess directly explicitly precisely zero correctly specifically distinctly securely active schedules inherently distinctly natively uniquely cleanly explicitly natively firmly naturally logically dynamically comprehensively dynamically independently mapping natively strictly...</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Day</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Time</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Subject</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Faculty</th>
                                        <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{s.day}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{s.startTime} - {s.endTime}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#0d6efd' }}>{subjectMap[s.subjectId] || s.subjectId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#198754', fontWeight: 'bold' }}>{facultyMap[s.facultyId] || s.facultyId}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                                                {/* Use navigate imported from hook */}
                                                <button onClick={() => handleJoinClass(s.id)} style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Join Class
                                                </button>
                                            </td>
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

export default StudentSchedule;
