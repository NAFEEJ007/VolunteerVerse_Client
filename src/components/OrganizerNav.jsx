import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiNewspaper, HiQuestionMarkCircle, HiPhotograph, HiChartBar, HiBell, HiClipboardList } from 'react-icons/hi';

const OrganizerNav = () => {
    const navItems = [
        { to: '/organizer/dashboard', label: 'Dashboard', icon: HiHome },
        { to: '/organizer/event-requests', label: 'Event Requests', icon: HiClipboardList },
        { to: '/organizer/articles', label: 'Articles', icon: HiNewspaper },
        { to: '/organizer/qa', label: 'Q/A', icon: HiQuestionMarkCircle },
        { to: '/organizer/gallery', label: 'Gallery', icon: HiPhotograph },
        { to: '/organizer/volunteer-stats', label: 'VolunteerStats', icon: HiChartBar },
        { to: '/organizer/notices', label: 'Notices', icon: HiBell },
    ];

    return (
        <nav className="bg-white shadow-sm mb-6">
            <div className="container mx-auto px-4">
                <div className="flex space-x-1 overflow-x-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${isActive
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 hover:text-primary'
                                }`
                            }
                        >
                            <item.icon className="text-lg" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default OrganizerNav;
