import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const StudentProfile = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchProfile(parsed.uid);
        }
    }, []);

    const fetchProfile = async (uid) => {
        setLoading(true);
        try {
            const data = await api.getStudentProfile(uid);
            setProfile(data);
            setFormData({
                name: data.name || '',
                dob: data.dob || '',
                phone: data.phone || '',
                gender: data.gender || '',
                address: data.address || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            const updated = await api.updateStudentProfile(user.uid, formData);
            setProfile(updated);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch(err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Profile...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>My Account</p>
                    <h1>Student Profile 🧑‍🎓</h1>
                </div>
            </header>

            {error && <p style={{ color: 'var(--sd-danger)', marginBottom: '16px' }}>{error}</p>}

            <div className="sd-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--sd-border)', paddingBottom: '16px' }}>
                    <h2 style={{ margin: 0 }}>Personal Details</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="sd-btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={styles.label}>Full Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={styles.label}>Date of Birth</label>
                                <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} style={styles.input} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={styles.label}>Phone Number</label>
                                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={styles.input} />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={styles.label}>Gender</label>
                                <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={styles.input}>
                                    <option value="">-- Select Gender --</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={styles.label}>Home Address</label>
                            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '80px'}} placeholder="Enter your full home address" />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="submit" disabled={actionLoading} className="sd-btn-primary">
                                {actionLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="sd-btn-secondary" style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--sd-border)', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <span style={styles.label}>Full Name</span>
                                <p style={styles.value}>{profile?.name}</p>
                            </div>
                            <div>
                                <span style={styles.label}>Email Address</span>
                                <p style={styles.value}>{user?.email}</p>
                            </div>
                            <div>
                                <span style={styles.label}>Date of Birth</span>
                                <p style={styles.value}>{profile?.dob || 'Not provided'}</p>
                            </div>
                            <div>
                                <span style={styles.label}>Phone Number</span>
                                <p style={styles.value}>{profile?.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <span style={styles.label}>Gender</span>
                                <p style={{...styles.value, textTransform: 'capitalize', fontWeight: 'bold'}}>{profile?.gender || 'Not provided'}</p>
                            </div>
                            <div>
                                <span style={styles.label}>Academic Batch</span>
                                <p style={styles.value}>{profile?.batchName || 'Not assigned yet'}</p>
                            </div>
                        </div>
                        <div>
                            <span style={styles.label}>Home Address</span>
                            <p style={styles.value}>{profile?.address || 'Not provided'}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="sd-card" style={{ marginTop: '24px' }}>
                <div className="sd-card-header">
                    <h2>Hostel Details 🏢</h2>
                </div>
                {profile?.hostelRoom ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--sd-border)' }}>
                        <div>
                            <span style={styles.label}>Room Number</span>
                            <p style={{ ...styles.value, fontSize: '24px', color: 'var(--sd-primary)' }}>{profile.hostelRoom}</p>
                        </div>
                        <div>
                            <span style={styles.label}>Floor</span>
                            <p style={{ ...styles.value, fontSize: '24px' }}>{profile.hostelFloor}</p>
                        </div>
                        <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: '13px', color: 'var(--sd-text-secondary)', marginTop: '8px' }}>
                            Note: Room allocations are managed by Hostel Administration. If you need to change your room, please contact them.
                        </p>
                    </div>
                ) : (
                    <p style={{ color: 'var(--sd-text-secondary)', fontStyle: 'italic', margin: 0, padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                        You are currently not allocated to any hostel room.
                    </p>
                )}
            </div>
        </div>
    );
};

const styles = {
    label: {
        display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--sd-text-secondary)'
    },
    input: {
        width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--sd-border)', outline: 'none', background: '#f8fafc', fontFamily: 'inherit', fontSize: '14px', transition: 'border-color 0.2s', boxSizing: 'border-box'
    },
    value: {
        margin: 0, fontSize: '15px', color: 'var(--sd-text-primary)', fontWeight: '500'
    }
};

export default StudentProfile;
