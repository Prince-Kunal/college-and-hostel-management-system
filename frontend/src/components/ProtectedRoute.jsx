import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if user exists in localStorage
    const userString = localStorage.getItem('user');
    
    // Check if user string exists and is valid (not null)
    const isAuthenticated = !!userString;

    // If not authenticated, immediately redirect back to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the child routes (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;
