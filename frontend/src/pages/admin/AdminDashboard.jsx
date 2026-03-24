import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newUserForm, setNewUserForm] = useState({ email: '', password: '', role: 'student' });
    const [creatingUser, setCreatingUser] = useState(false);
    const [createError, setCreateError] = useState(null);

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

    const updateUserRole = async (userId, newRole) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to update user role');
            
            // Update UI state
            setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to disable this user?")) return;
        
        try {
            const res = await fetch(`http://localhost:8000/api/v1/admin/users/${userId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to disable user');
            
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreatingUser(true);
        setCreateError(null);
        try {
            const res = await fetch('http://localhost:8000/api/v1/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserForm)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to create user');
            
            // Clear form and refresh list
            setNewUserForm({ email: '', password: '', role: 'student' });
            fetchUsers();
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreatingUser(false);
        }
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
                    <h2>Create New User</h2>
                    {createError && <p style={{ color: 'red', marginBottom: '1rem' }}>{createError}</p>}
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={newUserForm.email}
                            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={newUserForm.password}
                            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
                        />
                        <select
                            value={newUserForm.role}
                            onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" disabled={creatingUser} style={{ ...styles.button, backgroundColor: '#198754' }}>
                            {creatingUser ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
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
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map(u => (
                                            <tr key={u.id}>
                                                <td style={styles.td}>{u.email}</td>
                                                <td style={styles.td}>
                                                    <select 
                                                        value={u.role} 
                                                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ccc',
                                                            backgroundColor: u.role === 'admin' ? '#f8d7da' : u.role === 'faculty' ? '#ffeeba' : '#d1e7dd',
                                                            color: '#000',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="student">student</option>
                                                        <option value="faculty">faculty</option>
                                                        <option value="admin">admin</option>
                                                    </select>
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        style={{...styles.button, backgroundColor: '#dc3545', padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
                                                    >
                                                        Disable
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
            </main>
        </div>
    );
};

export default AdminDashboard;
