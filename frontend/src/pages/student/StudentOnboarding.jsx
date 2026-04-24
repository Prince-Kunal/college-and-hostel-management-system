import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const StudentOnboarding = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        phone: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!user || !user.uid) throw new Error("Authentication missing");
            await api.onboardStudent(user.uid, formData);
            navigate('/student');
        } catch (err) {
            setError(err.message || 'Failed to submit profile details.');
            setLoading(false);
        }
    };

    return (
        <div className="sd-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="sd-card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 className="sd-section-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Complete Your Profile</h2>
                <p style={{ textAlign: 'center', color: 'var(--sd-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                    Welcome to the campus portal! Please provide a explicitly required bits of natively missing information.
                </p>

                {error && <div style={{ color: 'var(--sd-danger)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--sd-text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--sd-border)', outline: 'none' }}
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--sd-text-secondary)' }}>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--sd-border)', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--sd-text-secondary)' }}>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--sd-border)', outline: 'none' }}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="sd-btn-primary" style={{ marginTop: '8px' }}>
                        {loading ? 'Saving Profile...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentOnboarding;
