import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiMenu, HiClipboardList, HiUserGroup, HiBell, HiPlus } from 'react-icons/hi';

const AdminNavbar = () => {
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 flex items-center justify-between h-16">
                <div className="flex items-center gap-6">
                    <NavLink to="/admin/dashboard" className="font-bold text-xl text-primary flex items-center gap-2">
                        <HiMenu className="text-2xl" /> Menu
                    </NavLink>
                    <NavLink to="/admin/events" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                        <HiClipboardList className="text-xl" /> Event Requests
                    </NavLink>
                    <NavLink to="/admin/events/create" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                        <HiPlus className="text-xl" /> Create Event
                    </NavLink>
                    <NavLink to="/admin/users" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                        <HiUserGroup className="text-xl" /> Manage Users
                    </NavLink>
                    <NavLink to="/admin/notices" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                        <HiBell className="text-xl" /> Notices
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
