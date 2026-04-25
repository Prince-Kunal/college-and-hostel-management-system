import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            navigate('/login');
        } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('email-already-in-use')) {
                setError('Email is already registered. Please login.');
            } else if (errMsg.includes('weak-password')) {
                setError('Password is too weak. Use at least 6 characters.');
            } else if (errMsg.includes('invalid-email')) {
                setError('Invalid email address format.');
            } else {
                setError('Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.glowBlob}></div>
            <div style={styles.dotPattern}></div>

            <div style={styles.container}>
                <div style={styles.brand}>
                    <div style={styles.logoIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                    </div>
                    <h1 style={styles.brandTitle}>Campus Hub</h1>
                    <p style={styles.brandSub}>Create your account</p>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Get Started</h2>
                    <p style={styles.cardSub}>Fill in your details to create an account</p>

                    {error && (
                        <div style={styles.errorBox}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup}>
                        <div style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} style={styles.input} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input type="password" name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} style={styles.input} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <span style={styles.footerText}>Already have an account?</span>
                        <Link to="/login" style={styles.link}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { position: 'relative', minHeight: '100vh', background: '#fcfcfd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    glowBlob: { position: 'absolute', top: '-200px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(92, 92, 255, 0.1) 30%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
    dotPattern: { position: 'absolute', top: '60px', right: '220px', width: '160px', height: '120px', backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.15) 2px, transparent 2px)', backgroundSize: '16px 16px', pointerEvents: 'none' },
    container: { position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', padding: '24px' },
    brand: { textAlign: 'center', marginBottom: '32px' },
    logoIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #5c5cff)', marginBottom: '16px', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' },
    brandTitle: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' },
    brandSub: { fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 },
    card: { background: '#ffffff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)', border: '1px solid #f1f5f9' },
    cardTitle: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    cardSub: { fontSize: '14px', fontWeight: '500', color: '#94a3b8', margin: '0 0 24px 0' },
    errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '20px' },
    field: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '12px 16px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    button: { width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', cursor: 'pointer', marginTop: '4px', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' },
    footer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '24px' },
    footerText: { fontSize: '14px', color: '#94a3b8', fontWeight: '500' },
    link: { fontSize: '14px', fontWeight: '600', color: '#5c5cff', textDecoration: 'none' },
};

export default SignupPage;
