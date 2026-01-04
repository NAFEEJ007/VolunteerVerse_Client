import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BannedPage from '../pages/BannedPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, userRole, isBanned, loading } = useAuth();

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Show banned message but keep layout
    if (isBanned) {
        return <BannedPage />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
