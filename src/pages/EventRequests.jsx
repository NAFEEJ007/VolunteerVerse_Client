import React, { useState, useEffect } from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import axios from 'axios';
import { auth } from '../firebase';
import Swal from 'sweetalert2';
import { getApiBase } from '../utils/api';

// Minimal, safe EventRequests page
export default function EventRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchRequests(mounted);
        return () => { mounted = false; };
    }, []);

    const fetchRequests = async (mounted = true) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            const res = await axios.get(`${getApiBase()}/api/organizer/event-requests`, { headers: { Authorization: `Bearer ${token}` } });
            if (mounted) setRequests(res.data || []);
        } catch (err) {
            console.error('Error fetching event requests', err);
            Swal.fire('Error', err.response?.data?.message || 'Failed to fetch event requests', 'error');
        } finally {
            if (mounted) setLoading(false);
        }
    };

    const handleApprove = async (eventId, requestId) => {
        try {
            const result = await Swal.fire({
                title: 'Approve Request?',
                text: "Volunteer will be added to the event.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, approve!'
            });

            if (result.isConfirmed) {
                const user = auth.currentUser;
                const token = await user.getIdToken();
                await axios.post(`${getApiBase()}/api/organizer/event-requests/${eventId}/${requestId}/approve`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Approved!', 'Volunteer has been added to the event.', 'success');
                setRequests(prev => prev.filter(r => r._id !== requestId));
            }
        } catch (err) {
            console.error('Error approving request:', err);
            Swal.fire('Error', err.response?.data?.message || 'Failed to approve request', 'error');
        }
    };

    const handleReject = async (eventId, requestId) => {
        try {
            const result = await Swal.fire({
                title: 'Reject Request?',
                text: "This request will be removed.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, reject!'
            });

            if (result.isConfirmed) {
                const user = auth.currentUser;
                const token = await user.getIdToken();
                await axios.delete(`${getApiBase()}/api/organizer/event-requests/${eventId}/${requestId}/reject`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Rejected!', 'Request has been rejected.', 'success');
                setRequests(prev => prev.filter(r => r._id !== requestId));
            }
        } catch (err) {
            console.error('Error rejecting request:', err);
            Swal.fire('Error', err.response?.data?.message || 'Failed to reject request', 'error');
        }
    };

    if (loading) {
        return (
            <OrganizerLayout>
                <div className="p-8 text-center">Loading event requests...</div>
            </OrganizerLayout>
        );
    }

    return (
        <OrganizerLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Event Join Requests</h1>
                {requests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">No requests found.</div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((r) => (
                            <div key={r._id} className="bg-white rounded-lg shadow p-4">
                                <div className="font-semibold">
                                    {r.volunteer?.displayName || r.volunteer?.username || r.volunteer?.email || r.user?.username || r.volunteerName || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">Event: {r.eventTitle || r.event?.title || 'N/A'}</div>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        className="btn btn-sm bg-green-600 text-white hover:bg-green-700 border-none"
                                        onClick={() => handleApprove(r.eventId, r._id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-sm bg-red-600 text-white hover:bg-red-700 border-none"
                                        onClick={() => handleReject(r.eventId, r._id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </OrganizerLayout>
    );
}
