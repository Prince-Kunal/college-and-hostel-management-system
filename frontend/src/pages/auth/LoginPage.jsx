import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulate login and redirect to admin dashboard
        navigate('/admin');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>System Login</h2>
                <p>Login page placeholder</p>
                <form onSubmit={handleLogin} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <input type="text" placeholder="Username" style={{ padding: '10px', width: '100%' }} />
                    </div>
                    <div>
                        <input type="password" placeholder="Password" style={{ padding: '10px', width: '100%' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
