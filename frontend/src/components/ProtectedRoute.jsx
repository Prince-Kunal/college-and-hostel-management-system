import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const userString = localStorage.getItem('user');
    const isAuthenticated = !!userString;
    
    // 1. Not logged in at all -> redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userString);

    // 2. Logged in, but lacking the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    // 3. Authenticated and authorized
    return <Outlet />;
};

export default ProtectedRoute;
