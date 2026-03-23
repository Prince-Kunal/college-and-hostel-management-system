import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
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
                <div style={styles.card}>
                    <h2>My Courses</h2>
                    {user && (
                        <p>Logged in as: <strong>{user.email}</strong> <span style={styles.badge}>{user.role}</span></p>
                    )}
                    <p style={{ marginTop: '1rem', color: '#666' }}>Welcome to the Student Dashboard. View your timetable and attendance here.</p>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
