import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LightRays from '../../components/ui/LightRays';
import BorderGlow from '../../components/ui/BorderGlow';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [raysColor, setRaysColor] = useState('#22c55e');

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Immediately redirect to login after successful signup
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
                setError('Invalid Credentials or Signup Failed');
            }

            // Turn rays red for 5 seconds
            setRaysColor('#ef4444');
            setTimeout(() => {
                setRaysColor('#22c55e');
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
        select: { width: '100%', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' },
        button: { width: '100%', padding: '0.75rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
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
                    glowColor="142 100 40" 
                    glowRadius={30}
                    glowIntensity={1.5}
                    animated={true}
                    colors={['#22c55e', '#10b981', '#14b8a6']}
                >
                    <div style={styles.innerBox}>
                        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>Create Account</h2>
                        {error && <div style={styles.error}>{error}</div>}
                        
                        <form onSubmit={handleSignup}>
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
                            <select name="role" value={formData.role} onChange={handleChange} style={styles.select}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </button>
                        </form>

                        <Link to="/login" style={styles.link}>
                            Already have an account? Login
                        </Link>
                    </div>
                </BorderGlow>
            </div>
        </div>
    );
};

export default SignupPage;
