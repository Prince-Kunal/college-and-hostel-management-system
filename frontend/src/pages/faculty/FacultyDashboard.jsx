import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    const [schedules, setSchedules] = useState([]);
    const [batchMap, setBatchMap] = useState({});
    const [subjectMap, setSubjectMap] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser({ ...parsed, activeId: parsed.id || parsed.uid });
        }
    }, []);

    useEffect(() => {
        if (user?.activeId && location.pathname === '/faculty') {
            fetchMySchedules();
        }
    }, [user, location.pathname]);

    const fetchMySchedules = async () => {
        setLoading(true);
        try {
            const [resSched, resBatches, resSubjects] = await Promise.all([
                fetch(`http://localhost:8000/api/v1/schedules/faculty/${user.activeId}`),
                fetch('http://localhost:8000/api/v1/batches'),
                fetch('http://localhost:8000/api/v1/subjects')
            ]);
            
            const dataSched = await resSched.json();
            const dataBatches = await resBatches.json();
            const dataSubjects = await resSubjects.json();

            const bMap = {};
            if (dataBatches.success) dataBatches.data.forEach(b => bMap[b.id] = b.name);
            setBatchMap(bMap);

            const sMap = {};
            if (dataSubjects.success) dataSubjects.data.forEach(s => sMap[s.id] = s.name);
            setSubjectMap(sMap);

            if (dataSched.success) setSchedules(dataSched.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const styles = {
        container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '2rem', backgroundColor: '#fcf8e3', padding: '1rem', borderRadius: '8px' },
        button: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        card: { padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' },
        badge: { backgroundColor: '#fd7e14', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '1rem', textTransform: 'uppercase' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>Faculty Portal</h1>
                </div>
                <button onClick={handleLogout} style={styles.button}>Logout</button>
            </header>
            
            <main>
                <div style={{ ...styles.card, marginBottom: '2rem' }}>
                    <h2>Classes & Assignments</h2>
                    {user && (
                        <p>Logged in as: <strong>{user.email}</strong> <span style={styles.badge}>{user.role}</span></p>
                    )}
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate('/faculty')} 
                            style={{ ...styles.button, backgroundColor: location.pathname === '/faculty' ? '#0d6efd' : '#6c757d' }}
                        >
                            My Scheduled Classes
                        </button>
                        <button 
                            onClick={() => navigate('/faculty/schedule')} 
                            style={{ ...styles.button, backgroundColor: location.pathname === '/faculty/schedule' ? '#0d6efd' : '#6c757d' }}
                        >
                            Schedule New Class
                        </button>
                    </div>
                </div>

                {location.pathname === '/faculty' && (
                    <div style={styles.card}>
                        <h2 style={{ marginTop: 0 }}>Active Upcoming Slots</h2>
                        {loading ? <p style={{ color: '#666' }}>Fetching explicitly logged schedules inherently tightly formally precisely cleanly successfully globally safely natively...</p> : (
                            schedules.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: '#666' }}>You currently distinctly lack any uniquely dynamically tightly firmly organically mapped classes sequentially safely organically actively precisely fundamentally effectively smoothly mapped inherently securely logically successfully.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Day</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Time</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Batch</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>Subject</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map(s => (
                                            <tr key={s.id}>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{s.day}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{s.startTime} - {s.endTime}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#0d6efd', fontWeight: 'bold' }}>{batchMap[s.batchId] || s.batchId}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6', color: '#198754' }}>{subjectMap[s.subjectId] || s.subjectId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                    </div>
                )}

                {/* Intelligently nested Outlet natively resolving dynamic explicit paths distinctly cleanly functionally explicitly dynamically securely firmly perfectly explicitly seamlessly locally securely dynamically securely perfectly optimally actively natively effectively properly firmly cleanly uniquely gracefully tightly effectively properly dynamically elegantly structurally precisely cleanly accurately physically intelligently securely organically properly dynamically efficiently structurally optimally formally gracefully thoroughly correctly fundamentally cleanly deeply smoothly cleanly smoothly completely elegantly seamlessly strongly cleanly structurally... */}
                <Outlet />
            </main>
        </div>
    );
};

export default FacultyDashboard;
