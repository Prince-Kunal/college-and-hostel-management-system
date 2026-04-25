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
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`);
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
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update user role');
            setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to disable this user?")) return;
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/admin/users/${userId}`, {
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
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create user');
            setNewUserForm({ email: '', password: '', role: 'student' });
            fetchUsers();
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <React.Fragment>
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <header className="sd-header">
                    <div className="sd-header-left">
                        <p>Administrator</p>
                        <h1>Admin Portal ⚙️</h1>
                        {user && <span className="sub">Logged in as: {user.email}</span>}
                    </div>
                    <div className="sd-header-right">
                        <button onClick={handleLogout} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-danger)', border: '1px solid var(--sd-border)' }}>Logout</button>
                    </div>
                </header>
                
                <main className="sd-grid">
                    <section className="sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                <h2>Quick Actions</h2>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button onClick={() => navigate('/batches/create')} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>+ Create Batch</button>
                            <button onClick={() => navigate('/subjects/create')} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>+ Create Subject</button>
                            <button onClick={() => navigate('/assignments/create')} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>+ Allocate Faculty</button>
                            <button onClick={() => navigate('/schedules/create')} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid var(--sd-border)' }}>+ Deploy Schedule</button>
                        </div>
                    </section>

                    <section className="sd-card">
                        <div className="sd-card-header">
                            <div className="sd-card-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                <h2>Add User manually</h2>
                            </div>
                        </div>
                        {createError && <p style={{ color: 'var(--sd-danger)', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>{createError}</p>}
                        
                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                type="email"
                                placeholder="Email address"
                                required
                                value={newUserForm.email}
                                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--sd-border)', outline: 'none', background: '#f8fafc', width: '100%' }}
                            />
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={newUserForm.password}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--sd-border)', outline: 'none', background: '#f8fafc', width: '100%' }}
                                />
                                <select
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--sd-border)', outline: 'none', background: '#f8fafc', flexShrink: 0 }}
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" disabled={creatingUser} className="sd-btn-primary" style={{ marginTop: '8px' }}>
                                {creatingUser ? 'Provisioning...' : 'Provision Account'}
                            </button>
                        </form>
                    </section>
                </main>

                <div className="sd-card" style={{ marginTop: '32px' }}>
                    <div className="sd-card-header">
                        <div className="sd-card-header-left">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h2>User Access Control</h2>
                        </div>
                    </div>
                    {loading && <p style={{ color: 'var(--sd-text-secondary)' }}>Syncing registry...</p>}
                    {!loading && !error && (
                        <>
                            {usersList.length === 0 ? (
                                <p style={{ color: 'var(--sd-text-secondary)', fontStyle: 'italic' }}>No active accounts found.</p>
                            ) : (
                                <div className="sd-table-wrapper">
                                    <table className="sd-table">
                                        <thead>
                                            <tr>
                                                <th>Email Address</th>
                                                <th>System Role</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersList.map(u => (
                                                <tr key={u.id}>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <select 
                                                            value={u.role} 
                                                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                            style={{
                                                                padding: '6px 16px',
                                                                borderRadius: '20px',
                                                                border: 'none',
                                                                outline: 'none',
                                                                backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'faculty' ? '#fef3c7' : '#e0e7ff',
                                                                color: u.role === 'admin' ? '#ef4444' : u.role === 'faculty' ? '#d97706' : 'var(--sd-primary)',
                                                                fontWeight: '700',
                                                                fontSize: '12px',
                                                                cursor: 'pointer',
                                                                WebkitAppearance: 'none'
                                                            }}
                                                        >
                                                            <option value="student">STUDENT</option>
                                                            <option value="faculty">FACULTY</option>
                                                            <option value="admin">ADMIN</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            style={{ background: 'none', border: '1px solid var(--sd-border)', outline: 'none', color: 'var(--sd-danger)', fontSize: '13px', fontWeight: 'bold', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' }}
                                                        >
                                                            Revoke
                                                        </button>
                                                    </td>
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
        </React.Fragment>
    );
};

export default AdminDashboard;
