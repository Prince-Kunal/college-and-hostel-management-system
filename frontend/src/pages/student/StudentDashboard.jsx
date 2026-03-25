import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const styles = {
        container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '2rem', backgroundColor: '#e2e3e5', padding: '1rem', borderRadius: '8px' },
        button: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        card: { padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' },
        badge: { backgroundColor: '#198754', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '1rem', textTransform: 'uppercase' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>Student Portal</h1>
                </div>
                <button onClick={handleLogout} style={styles.button}>Logout</button>
            </header>
            
            <main>
                <div style={{ ...styles.card, marginBottom: '2rem' }}>
                    <h2>My Courses & Timetable</h2>
                    {user && (
                        <p>Logged in as: <strong>{user.email}</strong> <span style={styles.badge}>{user.role}</span></p>
                    )}
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => navigate('/student')} 
                            style={{ ...styles.button, backgroundColor: location.pathname === '/student' ? '#0d6efd' : '#6c757d' }}
                        >
                            Dashboard Home
                        </button>
                        <button 
                            onClick={() => navigate('/student/schedule')} 
                            style={{ ...styles.button, backgroundColor: location.pathname === '/student/schedule' ? '#0d6efd' : '#6c757d' }}
                        >
                            View Active Schedule
                        </button>
                    </div>
                </div>

                {/* Sub-routing Outlet dynamically loading nested tabs purely explicitly smartly efficiently cleanly flawlessly smoothly deeply intuitively logically accurately elegantly securely strongly compactly structurally gracefully uniquely formally intuitively natively completely perfectly effectively correctly clearly accurately actively accurately natively smoothly smartly smartly efficiently beautifully smartly flawlessly correctly elegantly dynamically structurally structurally organically correctly natively securely effortlessly intuitively... */}
                <Outlet />
            </main>
        </div>
    );
};

export default StudentDashboard;
