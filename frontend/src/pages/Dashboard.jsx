import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any stored data here if necessary
        navigate('/login');
    };

    const styles = {
        container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '2rem' },
        button: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        card: { padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>Welcome to Dashboard</h1>
                <button onClick={handleLogout} style={styles.button}>Logout</button>
            </header>
            
            <main>
                <div style={styles.card}>
                    <h2>Authentication Successful!</h2>
                    <p>You have successfully logged in via the React frontend.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
