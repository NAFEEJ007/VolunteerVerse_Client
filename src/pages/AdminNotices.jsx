import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

const AdminNotices = () => {
    const [notices, setNotices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '' });

    const fetchNotices = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/notices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(response.data);
        } catch (error) {
            console.error('Error fetching notices:', error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/notices`, {
                title: form.title,
                content: form.content,
                isAdminNotice: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('Success', 'Notice published!', 'success');
            setShowForm(false);
            setForm({ title: '', content: '' });
            fetchNotices();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to publish notice', 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Notices</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn bg-primary text-white hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Create Notice'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreateNotice} className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <button type="submit" className="btn bg-green-600 text-white hover:bg-green-700">Publish Notice</button>
                </form>
            )}

            <div className="space-y-4">
                {notices.filter(n => n.itemType === 'notice').length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">No notices yet.</div>
                ) : (
                    notices.filter(n => n.itemType === 'notice').map(notice => (
                        <div key={notice._id} className="bg-white rounded-lg shadow-md p-6 relative">
                            {notice.isAdminNotice && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-6xl font-extrabold text-red-200 opacity-30 select-none" style={{ position: 'absolute', zIndex: 0 }}>
                                        ADMIN NOTICE
                                    </span>
                                </div>
                            )}
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{notice.title}</h3>
                                <p className="text-gray-700 mb-2">{notice.content}</p>
                                <p className="text-xs text-gray-400">Published: {new Date(notice.createdAt).toLocaleString()}</p>
                                <button
                                    className="btn bg-red-600 text-white hover:bg-red-700 mt-2"
                                    onClick={async () => {
                                        const confirmed = await Swal.fire({
                                            title: 'Delete Notice?',
                                            text: 'This will permanently remove the notice for all users.',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#d33',
                                            cancelButtonColor: '#3085d6',
                                            confirmButtonText: 'Yes, delete it!'
                                        });
                                        if (confirmed.isConfirmed) {
                                            try {
                                                const user = auth.currentUser;
                                                if (!user) return;
                                                const token = await user.getIdToken();
                                                await axios.delete(`${getApiBase()}/api/notices/${notice._id}`,
                                                    { headers: { Authorization: `Bearer ${token}` } });
                                                Swal.fire('Deleted!', 'Notice has been deleted.', 'success');
                                                fetchNotices();
                                            } catch (error) {
                                                Swal.fire('Error', error.response?.data?.message || 'Failed to delete notice', 'error');
                                            }
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNotices;
