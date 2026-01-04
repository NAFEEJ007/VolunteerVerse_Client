import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { HiHome, HiNewspaper, HiQuestionMarkCircle, HiPhotograph, HiCalendar, HiLogout, HiLogin, HiBell, HiChartBar, HiClipboardList, HiPlus, HiUserGroup } from 'react-icons/hi';
import axios from 'axios';
import { getApiBase } from '../utils/api';

const Navbar = () => {
    const { currentUser, userRole, username, displayName } = useAuth();
    const [hasNewNotices, setHasNewNotices] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const volunteerNavItems = [
        { to: '/volunteer/dashboard', label: 'Home', icon: HiHome },
        { to: '/volunteer/articles', label: 'Articles', icon: HiNewspaper },
        { to: '/volunteer/qa', label: 'Q/A', icon: HiQuestionMarkCircle },
        { to: '/volunteer/gallery', label: 'Gallery', icon: HiPhotograph },
        { to: '/volunteer/my-events', label: 'My Events', icon: HiCalendar },
        { to: '/volunteer/notices', label: 'Notices', icon: HiBell, hasBadge: true },
    ];

    const organizerNavItems = [
        { to: '/organizer/dashboard', label: 'Dashboard', icon: HiHome },
        { to: '/organizer/event-requests', label: 'Event Requests', icon: HiClipboardList },
        { to: '/organizer/articles', label: 'Articles', icon: HiNewspaper },
        { to: '/organizer/qa', label: 'Q/A', icon: HiQuestionMarkCircle },
        { to: '/organizer/gallery', label: 'Gallery', icon: HiPhotograph },
        { to: '/organizer/volunteer-stats', label: 'VolunteerStats', icon: HiChartBar },
        { to: '/organizer/notices', label: 'Notices', icon: HiBell },
    ];

    const adminNavItems = [
        { to: '/admin/events', label: 'Event Requests', icon: HiClipboardList },
        { to: '/admin/users', label: 'Manage Users', icon: HiUserGroup },
        { to: '/admin/notices', label: 'Notices', icon: HiBell }
    ];

    const fetchCurrentUser = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                const response = await axios.get(`${getApiBase()}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUserId(response.data._id);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

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
        if (currentUser && userRole === 'volunteer') {
            fetchCurrentUser();
        }
    }, [currentUser, userRole]);

    useEffect(() => {
        if (currentUserId) {
            checkNotices();
        }
    }, [currentUserId]);

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

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary shrink-0" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <img src="/logo.svg" alt="VolunteerVerse Logo" className="h-8 w-8" />
                        VolunteerVerse
                    </Link>

                    {/* Navigation Items (for volunteers) */}
                    {currentUser && userRole === 'volunteer' && (
                        <div className="hidden md:flex space-x-1 mx-8 grow">
                            {volunteerNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="text-lg" />
                                    {item.label}
                                    {item.hasBadge && hasNewNotices && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Navigation Items (for organizers) */}
                    {currentUser && userRole === 'organizer' && (
                        <div className="hidden md:flex space-x-1 mx-8 grow">
                            {organizerNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="text-lg" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Navigation Items (for admins) */}
                    {currentUser && userRole === 'admin' && (
                        <div className="hidden md:flex space-x-1 mx-8 grow">
                            {adminNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="text-lg" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* User Info / Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <span className="text-gray-600 text-sm hidden sm:inline">
                                    {displayName || username || currentUser.email} <span className="text-primary font-semibold">({userRole})</span>
                                </span>
                                <button onClick={handleLogout} className="btn btn-outline flex items-center gap-2">
                                    <HiLogout />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                    <HiLogin />
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation (for volunteers) */}
                {currentUser && userRole === 'volunteer' && (
                    <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
                        {volunteerNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 relative ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <item.icon className="text-base" />
                                {item.label}
                                {item.hasBadge && hasNewNotices && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* Mobile Navigation (for organizers) */}
                {currentUser && userRole === 'organizer' && (
                    <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
                        {organizerNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <item.icon className="text-base" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* Mobile Navigation (for admins) */}
                {currentUser && userRole === 'admin' && (
                    <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
                        {adminNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <item.icon className="text-base" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
