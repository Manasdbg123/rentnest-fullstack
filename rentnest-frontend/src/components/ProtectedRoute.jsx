import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Please Sign In or Register to access this feature.");
        return <Navigate to="/" replace />; // Send them back to the dashboard
    }

    return children;
};

export default ProtectedRoute;