import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';
import { HiCheckCircle, HiXCircle, HiCalendar, HiLocationMarker, HiUser } from 'react-icons/hi';

const EventModeration = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        image: ''
    });
    const [creating, setCreating] = useState(false);

    const fetchPendingEvents = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/admin/events/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pending events:', error);
            Swal.fire('Error', 'Failed to fetch pending events', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/admin/events/create`, {
                ...newEvent,
                status: 'approved' // publish directly
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('Created!', 'Event has been published', 'success');
            setNewEvent({ title: '', description: '', date: '', location: '', image: '' });
            fetchPendingEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            Swal.fire('Error', 'Failed to create event', 'error');
        }
        setCreating(false);
    };

    const handleApprove = async (eventId) => {
        try {
            const result = await Swal.fire({
                title: 'Approve Event?',
                text: 'This event will be published and visible to all users',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, approve it!'
            });

            if (result.isConfirmed) {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.post(
                    `${getApiBase()}/api/admin/events/${eventId}/approve`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire('Approved!', 'Event has been approved', 'success');
                fetchPendingEvents();
            }
        } catch (error) {
            console.error('Error approving event:', error);
            Swal.fire('Error', 'Failed to approve event', 'error');
        }
    };

    const handleDelete = async (eventId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Event?',
                text: 'This action cannot be undone',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.delete(
                    `${getApiBase()}/api/admin/events/${eventId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire('Deleted!', 'Event has been deleted', 'success');
                fetchPendingEvents();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            Swal.fire('Error', 'Failed to delete event', 'error');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Event Moderation</h1>
                <p className="text-gray-600">Review and approve pending events</p>
            </div>


            {/* Pending Events Section */}
            {events.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Events</h3>
                    <p className="text-gray-500">All events have been reviewed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                                    <p className="text-gray-600 mb-4">{event.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                        <span className="flex items-center gap-1">
                                            <HiCalendar className="text-primary" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HiLocationMarker className="text-primary" />
                                            {event.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HiUser className="text-primary" />
                                            {event.organizer?.displayName || event.organizer?.email}
                                        </span>
                                    </div>

                                    {event.image && (
                                        <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 md:w-48">
                                    <button
                                        onClick={() => handleApprove(event._id)}
                                        className="btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                                    >
                                        <HiCheckCircle className="text-xl" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        className="btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                                    >
                                        <HiXCircle className="text-xl" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default EventModeration;
