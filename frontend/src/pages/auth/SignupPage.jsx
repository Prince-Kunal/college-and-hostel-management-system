import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        idNumber: ''
    });
    const [errors, setErrors] = useState({});

    const validateName = (name) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(name);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'name' && !validateName(value)) {
            return; // Don't allow typing invalid characters
        }

        setFormData({...formData, [name]: value});
        
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSignup = (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Mock signup and redirect to the specific role dashboard
        navigate(`/${formData.role}`);
    };

    return (
        <div className="auth-container">
            <div className="auth-box glass-effect">
                <div className="auth-header">
                    <h2>Create an Account</h2>
                    <p>Join the College & Hostel Management System</p>
                </div>
                <form onSubmit={handleSignup} className="auth-form" noValidate>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                    <div className="form-row">
                        <div className="input-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                                <option value="hostel">Hostel Manager</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>ID Number</label>
                            <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="AD-12345" required />
                            {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
                        </div>
                    </div>
                    <button type="submit" className="auth-btn">Sign Up</button>
                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Login here</Link></p>
                    </div>
                </form>
            </div>
            
            {/* Background animated shapes */}
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
        </div>
    );
};

export default SignupPage;
