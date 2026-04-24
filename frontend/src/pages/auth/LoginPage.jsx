import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LightRays from '../../components/ui/LightRays';
import BorderGlow from '../../components/ui/BorderGlow';
import { api } from '../../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [raysColor, setRaysColor] = useState('#3b82f6');

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Securely store the user object including their role
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
            // Clean up error message
            const errMsg = err.message || '';
            if (errMsg.includes('disabled')) {
                setError(errMsg); // Show exact standard disabled rejection
            } else if (errMsg.includes('invalid-credential') || errMsg.includes('user-not-found') || errMsg.includes('wrong-password')) {
                setError('Invalid Credentials');
            } else {
                setError('Login failed. Please try again.');
            }

            // Turn rays red for 5 seconds
            setRaysColor('#ef4444');
            setTimeout(() => {
                setRaysColor('#3b82f6');
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' },
        wrapper: { position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' },
        innerBox: { padding: '2rem', display: 'flex', flexDirection: 'column' },
        input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' },
        button: { width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' },
        error: { color: 'red', marginBottom: '1rem', textAlign: 'center' },
        link: { display: 'block', textAlign: 'center', marginTop: '1rem', color: '#60a5fa', textDecoration: 'none' }
    };

    return (
        <div style={styles.container}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <LightRays
                  raysOrigin="top-center"
                  raysColor={raysColor}
                  raysSpeed={1.5}
                  lightSpread={1.2}
                  rayLength={2.5}
                  pulsating={true}
                  fadeDistance={0.8}
                  mouseInfluence={0.2}
                />
            </div>

            <div style={styles.wrapper}>
                <BorderGlow 
                    backgroundColor="rgba(30, 41, 59, 0.95)" 
                    borderRadius={12} 
                    glowColor="210 100 60" 
                    glowRadius={30}
                    glowIntensity={1.5}
                    animated={true}
                    colors={['#3b82f6', '#8b5cf6', '#ec4899']}
                >
                    <div style={styles.innerBox}>
                        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>Login</h2>
                        {error && <div style={styles.error}>{error}</div>}
                        
                        <form onSubmit={handleLogin}>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Email Address" 
                                value={formData.email} 
                                onChange={handleChange} 
                                style={styles.input} 
                                required 
                            />
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                style={styles.input} 
                                required 
                            />
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <Link to="/signup" style={styles.link}>
                            Don't have an account? Sign up
                        </Link>
                    </div>
                </BorderGlow>
            </div>
        </div>
    );
};

export default LoginPage;
