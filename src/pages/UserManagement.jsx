import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';
import { HiBan, HiCheckCircle } from 'react-icons/hi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, volunteers, organizers, banned

    const fetchUsers = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'Failed to fetch users', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Debug: Log raw users fetched from backend
    useEffect(() => {
        if (users.length > 0) {
            console.log('Fetched users:', users);
        }
    }, [users]);

    const handleBan = async (userId, userName) => {
        try {
            const result = await Swal.fire({
                title: 'Ban User?',
                text: `${userName} will not be able to access the application`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, ban user!'
            });

            if (result.isConfirmed) {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.put(
                    `${getApiBase()}/api/admin/users/${userId}/ban`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire('Banned!', 'User has been banned', 'success');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error banning user:', error);
            Swal.fire('Error', 'Failed to ban user', 'error');
        }
    };

    const handleUnban = async (userId, userName) => {
        try {
            const result = await Swal.fire({
                title: 'Unban User?',
                text: `${userName} will regain access to the application`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, unban user!'
            });

            if (result.isConfirmed) {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.put(
                    `${getApiBase()}/api/admin/users/${userId}/unban`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire('Unbanned!', 'User has been unbanned', 'success');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error unbanning user:', error);
            Swal.fire('Error', 'Failed to unban user', 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
                <p className="text-gray-600">Manage users and their access</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-3 font-medium transition-all ${filter === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    All ({users.length})
                </button>
                <button
                    onClick={() => setFilter('volunteer')}
                    className={`px-6 py-3 font-medium transition-all ${filter === 'volunteer'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Volunteers ({users.filter(u => u.role === 'volunteer').length})
                </button>
                <button
                    onClick={() => setFilter('organizer')}
                    className={`px-6 py-3 font-medium transition-all ${filter === 'organizer'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Organizers ({users.filter(u => u.role === 'organizer').length})
                </button>
                <button
                    onClick={() => setFilter('banned')}
                    className={`px-6 py-3 font-medium transition-all ${filter === 'banned'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Banned ({users.filter(u => u.isBanned).length})
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.displayName || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'organizer' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.score || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isBanned ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user.role !== 'admin' && (
                                            user.isBanned ? (
                                                <button
                                                    onClick={() => handleUnban(user._id, user.displayName || user.email)}
                                                    className="text-green-600 hover:text-green-900 font-medium flex items-center gap-1"
                                                >
                                                    <HiCheckCircle /> Unban
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBan(user._id, user.displayName || user.email)}
                                                    className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"
                                                >
                                                    <HiBan /> Ban
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
