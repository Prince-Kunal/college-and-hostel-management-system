import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('user', JSON.stringify(data.data));

            const role = data.data.role;
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'faculty') {
                navigate('/faculty');
            } else {
                try {
                    const profile = await api.getStudentProfile(data.data.uid);
                    if (!profile.name || !profile.dob || !profile.phone || !profile.onboarded) {
                        navigate('/student/onboarding');
                    } else {
                        navigate('/student');
                    }
                } catch (err) {
                    navigate('/student/onboarding');
                }
            }
        } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('disabled')) {
                setError(errMsg);
            } else if (errMsg.includes('invalid-credential') || errMsg.includes('user-not-found') || errMsg.includes('wrong-password')) {
                setError('Invalid email or password');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Background decorations matching dashboard */}
            <div style={styles.glowBlob}></div>
            <div style={styles.dotPattern}></div>

            <div style={styles.container}>
                {/* Branding */}
                <div style={styles.brand}>
                    <div style={styles.logoIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                    </div>
                    <h1 style={styles.brandTitle}>Campus Hub</h1>
                    <p style={styles.brandSub}>College & Hostel Management System</p>
                </div>

                {/* Login Card */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Welcome back</h2>
                    <p style={styles.cardSub}>Sign in to your account to continue</p>

                    {error && (
                        <div style={styles.errorBox}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? (
                                <span style={styles.loadingText}>
                                    <span style={styles.spinner}></span>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <span style={styles.footerText}>Don't have an account?</span>
                        <Link to="/signup" style={styles.link}>Create account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: {
        position: 'relative',
        minHeight: '100vh',
        background: '#fcfcfd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    glowBlob: {
        position: 'absolute',
        top: '-200px',
        right: '-200px',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(92, 92, 255, 0.2) 0%, rgba(162, 162, 255, 0.1) 30%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
    },
    dotPattern: {
        position: 'absolute',
        top: '60px',
        right: '220px',
        width: '160px',
        height: '120px',
        backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.15) 2px, transparent 2px)',
        backgroundSize: '16px 16px',
        pointerEvents: 'none',
    },
    container: {
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        padding: '24px',
    },
    brand: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logoIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #5c5cff, #8b5cf6)',
        marginBottom: '16px',
        boxShadow: '0 4px 16px rgba(92, 92, 255, 0.3)',
    },
    brandTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 4px 0',
    },
    brandSub: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#64748b',
        margin: 0,
    },
    card: {
        background: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        border: '1px solid #f1f5f9',
    },
    cardTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 4px 0',
    },
    cardSub: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#94a3b8',
        margin: '0 0 24px 0',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        color: '#ef4444',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px',
    },
    field: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        background: '#f8fafc',
        color: '#0f172a',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit',
    },
    button: {
        width: '100%',
        padding: '14px',
        fontSize: '15px',
        fontWeight: '700',
        border: 'none',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #5c5cff, #7c5cff)',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '4px',
        fontFamily: 'inherit',
        boxShadow: '0 2px 8px rgba(92, 92, 255, 0.3)',
    },
    loadingText: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
    },
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        marginTop: '24px',
    },
    footerText: {
        fontSize: '14px',
        color: '#94a3b8',
        fontWeight: '500',
    },
    link: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#5c5cff',
        textDecoration: 'none',
    },
};

export default LoginPage;
