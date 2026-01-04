import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { HiClipboardList, HiUsers, HiBell, HiChartBar, HiPlus } from 'react-icons/hi';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

const AdminDashboard = () => {
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        location: '',
        image: '',
        capacity: '',
        fundraiserLink: ''
    });

    const [statsData, setStatsData] = useState({
        pendingEventsCount: 0,
        totalUsersCount: 0,
        activeNoticesCount: 0,
        totalEventsCount: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                const response = await axios.get(`${getApiBase()}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatsData(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const stats = [
        { title: 'Pending Events', value: statsData.pendingEventsCount, icon: HiClipboardList, color: 'bg-yellow-500' },
        { title: 'Total Users', value: statsData.totalUsersCount, icon: HiUsers, color: 'bg-blue-500' },
        { title: 'Active Notices', value: statsData.activeNoticesCount, icon: HiBell, color: 'bg-green-500' },
        { title: 'Total Events', value: statsData.totalEventsCount, icon: HiChartBar, color: 'bg-purple-500' },
    ];

    const handleEventFormChange = (e) => {
        setEventForm({ ...eventForm, [e.target.name]: e.target.value });
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire('Error', 'You must be logged in', 'error');
                return;
            }

            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/events`,
                {
                    title: eventForm.title,
                    description: eventForm.description,
                    category: eventForm.category,
                    date: eventForm.date,
                    location: eventForm.location,
                    image: eventForm.image,
                    capacity: parseInt(eventForm.capacity),
                    fundraiserLink: eventForm.fundraiserLink
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire('Success', 'Event posted successfully! Volunteers can now request to join.', 'success');
            setShowEventForm(false);
            setEventForm({
                title: '',
                description: '',
                category: '',
                date: '',
                location: '',
                image: '',
                capacity: '',
                fundraiserLink: ''
            });
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create event', 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome to the VolunteerVerse Admin Panel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Event Creation Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Create Event</h2>
                    <button
                        onClick={() => setShowEventForm(!showEventForm)}
                        className="btn bg-primary text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                        <HiPlus className="text-xl" />
                        {showEventForm ? 'Cancel' : 'Post Event'}
                    </button>
                </div>

                {showEventForm && (
                    <form onSubmit={handleCreateEvent} className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={eventForm.title}
                                    onChange={handleEventFormChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Beach Cleanup Drive"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={eventForm.category}
                                    onChange={handleEventFormChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Environment">Environment</option>
                                    <option value="Education">Education</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Community">Community</option>
                                    <option value="Animal Welfare">Animal Welfare</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={eventForm.date}
                                    onChange={handleEventFormChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={eventForm.location}
                                    onChange={handleEventFormChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Cox's Bazar Beach"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity *
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={eventForm.capacity}
                                    onChange={handleEventFormChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Maximum number of volunteers"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    name="image"
                                    value={eventForm.image}
                                    onChange={handleEventFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={eventForm.description}
                                onChange={handleEventFormChange}
                                required
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe the event and what volunteers will be doing..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fundraiser Link (Optional)
                            </label>
                            <input
                                type="url"
                                name="fundraiserLink"
                                value={eventForm.fundraiserLink}
                                onChange={handleEventFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="https://example.com/fundraiser"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowEventForm(false)}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn bg-green-600 text-white hover:bg-green-700"
                            >
                                Post Event
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="/admin/events" className="btn bg-primary text-white hover:bg-blue-700">
                        Moderate Events
                    </a>
                    <a href="/admin/users" className="btn bg-green-600 text-white hover:bg-green-700">
                        Manage Users
                    </a>
                    <a href="/admin/notices" className="btn bg-purple-600 text-white hover:bg-purple-700">
                        Create Notice
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
