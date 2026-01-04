import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VolunteerNav = () => {
    const [hasNewNotices, setHasNewNotices] = useState(false);
    const { currentUser, displayName } = useAuth();
    const currentUserId = currentUser?.uid; // Using uid or _id depending on what's needed for notices
    const location = useLocation();

    const navItems = [
        { to: '/volunteer/dashboard', label: '🏠 Home', icon: '🏠' },
        { to: '/volunteer/articles', label: '📰 Articles', icon: '📰' },
        { to: '/volunteer/qa', label: '💬 Q/A', icon: '💬' },
        { to: '/volunteer/gallery', label: '🖼️ Gallery', icon: '🖼️' },
        { to: '/volunteer/my-events', label: '📅 My Events', icon: '📅' },
        { to: '/volunteer/notices', label: '📢 Notices', icon: '📢', hasBadge: true },
    ];

    // Removed fetchCurrentUser as we use useAuth now

    const checkNotices = async () => {
        if (!currentUserId) return;

        try {
            const response = await axios.get(`${getApiBase()}/api/notices?userId=${currentUserId}`);
            const hasUnread = response.data.some(item => !item.isRead);
            setHasNewNotices(hasUnread);
        } catch (error) {
            console.error('Error checking notices:', error);
        }
    };

    useEffect(() => {
        if (!currentUserId) return;

        checkNotices();

        // Listen for local update event
        const handleNoticesViewed = () => setHasNewNotices(false);
        window.addEventListener('noticesViewed', handleNoticesViewed);

        // Poll for new notices every 60 seconds
        const interval = setInterval(checkNotices, 60000);

        return () => {
            window.removeEventListener('noticesViewed', handleNoticesViewed);
            clearInterval(interval);
        };
    }, [currentUserId]);

    // Re-check when location changes (in case we navigated away and back)
    useEffect(() => {
        if (location.pathname !== '/volunteer/notices' && currentUserId) {
            checkNotices();
        }
    }, [location, currentUserId]);

    return (
        <nav className="bg-white shadow-sm mb-6">
            <div className="container mx-auto px-4">
                <div className="flex space-x-1 overflow-x-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${isActive
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 hover:text-primary'
                                }`
                            }
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                            {item.hasBadge && hasNewNotices && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default VolunteerNav;
