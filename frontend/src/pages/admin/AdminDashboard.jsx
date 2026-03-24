import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/admin/users');
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
            
            setUsersList(data.data);
        } catch (err) {
            setError(err.message);
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
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '2rem', backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' },
        button: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        card: { padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '1.5rem' },
        badge: { backgroundColor: '#0d6efd', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '1rem', textTransform: 'uppercase' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
        th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #dee2e6' },
        td: { padding: '0.75rem', borderBottom: '1px solid #dee2e6' },
        emptyState: { textAlign: 'center', color: '#6c757d', padding: '2rem' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>Admin Portal</h1>
                </div>
                <button onClick={handleLogout} style={styles.button}>Logout</button>
            </header>
            
            <main>
                <div style={styles.card}>
                    <h2>System Overview</h2>
                    {user && (
                        <p>Logged in as: <strong>{user.email}</strong> <span style={styles.badge}>{user.role}</span></p>
                    )}
                </div>

                <div style={styles.card}>
                    <h2>User Management</h2>
                    {loading && <p>Loading users...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    
                    {!loading && !error && (
                        <>
                            {usersList.length === 0 ? (
                                <p style={styles.emptyState}>No users found in the system.</p>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map(u => (
                                            <tr key={u.id}>
                                                <td style={styles.td}>{u.email}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.badge, 
                                                        marginLeft: 0, 
                                                        backgroundColor: u.role === 'admin' ? '#dc3545' : u.role === 'faculty' ? '#fd7e14' : '#198754'
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
