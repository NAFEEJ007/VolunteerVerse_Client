import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import VolunteerLayout from '../components/VolunteerLayout';
import OrganizerLayout from '../components/OrganizerLayout';

// Lazy load AdminLayout to avoid potential circular dependency or import issues
const AdminLayout = React.lazy(() => import('../components/AdminLayout'));

const Notices = () => {
    const { userRole, currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [showPollForm, setShowPollForm] = useState(false);
    const [showNoticeForm, setShowNoticeForm] = useState(false);
    const [pollForm, setPollForm] = useState({
        question: '',
        options: ['', '', '', '']
    });
    const [noticeForm, setNoticeForm] = useState({
        title: '',
        content: ''
    });

    async function markAsRead(itemIds) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/notices/mark-read`,
                { itemIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Dispatch event to update navbar
            window.dispatchEvent(new Event('noticesViewed'));
        } catch (error) {
            console.error('Error marking notices as read:', error);
        }
    }

    async function fetchNotices(userId = currentUserId) {
        try {
            const url = userId ? `${getApiBase()}/api/notices?userId=${userId}` : `${getApiBase()}/api/notices`;
            const response = await axios.get(url);
            setItems(response.data);
            setLoading(false);

            // Mark all unread notices as read (only for volunteers)
            if (userRole === 'volunteer') {
                const unreadItems = response.data
                    .filter(item => !item.isRead)
                    .map(item => ({ id: item._id, type: item.itemType }));

                if (unreadItems.length > 0) {
                    await markAsRead(unreadItems);
                }
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
            setLoading(false);
        }
    }

    async function fetchCurrentUser(user) {
        try {
            if (user) {
                const token = await user.getIdToken();
                const response = await axios.get(`${getApiBase()}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUserId(response.data._id);
                fetchNotices(response.data._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            // If we fail to get DB ID, still try to load notices (without read status)
            fetchNotices();
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchCurrentUser(currentUser);
        }
    }, [currentUser]);

    

    

    const handleVote = async (pollId, optionIndex) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire('Error', 'You must be logged in to vote', 'error');
                return;
            }

            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/notices/poll/${pollId}/vote`,
                { optionIndex },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire('Success', 'Vote recorded!', 'success');
            fetchNotices(); // Refresh to show new vote counts
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to vote', 'error');
        }
    };

    const handlePollFormChange = (e, index = null) => {
        if (index !== null) {
            const newOptions = [...pollForm.options];
            newOptions[index] = e.target.value;
            setPollForm({ ...pollForm, options: newOptions });
        } else {
            setPollForm({ ...pollForm, [e.target.name]: e.target.value });
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire('Error', 'You must be logged in', 'error');
                return;
            }

            // Filter out empty options
            const validOptions = pollForm.options.filter(opt => opt.trim() !== '');

            if (validOptions.length < 2) {
                Swal.fire('Error', 'Please provide at least 2 options', 'error');
                return;
            }

            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/notices/poll`,
                {
                    question: pollForm.question,
                    options: validOptions
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire('Success', 'Poll created successfully!', 'success');
            setShowPollForm(false);
            setPollForm({ question: '', options: ['', '', '', ''] });
            fetchNotices();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create poll', 'error');
        }
    };

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire('Error', 'You must be logged in', 'error');
                return;
            }

            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/notices`,
                {
                    title: noticeForm.title,
                    content: noticeForm.content,
                    type: 'announcement'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire('Success', 'Notice created successfully!', 'success');
            setShowNoticeForm(false);
            setNoticeForm({ title: '', content: '' });
            fetchNotices();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create notice', 'error');
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'organizer': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const Layout = userRole === 'organizer' ? OrganizerLayout : userRole === 'admin' ? AdminLayout : VolunteerLayout;

    if (loading) {
        return (
            <Suspense fallback={<div>Loading Layout...</div>}>
                <Layout>
                    <div className="flex justify-center items-center h-screen">Loading...</div>
                </Layout>
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<div>Loading Layout...</div>}>
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Notices & Polls</h1>
                        <div className="flex gap-2">
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setShowNoticeForm(!showNoticeForm)}
                                    className="btn bg-red-600 text-white hover:bg-red-700"
                                >
                                    {showNoticeForm ? 'Cancel' : '+ Create Notice'}
                                </button>
                            )}
                            {(userRole === 'organizer' || userRole === 'admin') && (
                                <button
                                    onClick={() => setShowPollForm(!showPollForm)}
                                    className="btn btn-primary"
                                >
                                    {showPollForm ? 'Cancel' : '+ Create Poll'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notice Creation Form (Admin Only) */}
                    {userRole === 'admin' && showNoticeForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-red-600">
                            <h2 className="text-xl font-bold mb-4 text-red-800">Create Admin Notice</h2>
                            <form onSubmit={handleCreateNotice} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={noticeForm.title}
                                        onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Notice Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content *
                                    </label>
                                    <textarea
                                        value={noticeForm.content}
                                        onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Notice Content"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowNoticeForm(false)}
                                        className="btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Post Notice
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Poll Creation Form (Organizers/Admins Only) */}
                    {(userRole === 'organizer' || userRole === 'admin') && showPollForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">Create Event Poll</h2>
                            <p className="text-gray-600 mb-4">
                                Create a poll to gather volunteer preferences for upcoming events. Use the results to decide which events to organize.
                            </p>
                            <form onSubmit={handleCreatePoll} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Poll Question *
                                    </label>
                                    <input
                                        type="text"
                                        name="question"
                                        value={pollForm.question}
                                        onChange={handlePollFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="What type of event would you like to participate in?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Options (at least 2 required)
                                    </label>
                                    {pollForm.options.map((option, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={option}
                                            onChange={(e) => handlePollFormChange(e, index)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPollForm(false)}
                                        className="btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Create Poll
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-6">
                        {items.length === 0 ? (
                            <p className="text-gray-500 text-center">No notices or polls at the moment.</p>
                        ) : (
                            items.map((item) => (
                                <div key={item._id} className={`bg-white rounded-lg shadow-md p-6 border border-gray-100 relative overflow-hidden ${item.isAdminNotice ? 'border-red-200' : ''}`}>
                                    {item.isAdminNotice && (
                                        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10 transform rotate-12">
                                            <span className="text-6xl font-black text-red-600 whitespace-nowrap border-4 border-red-600 px-4 py-2 rounded-lg transform -rotate-12 inline-block">
                                                ADMIN NOTICE
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${item.itemType === 'poll' ? 'bg-purple-100 text-purple-800' :
                                                    item.isAdminNotice ? 'bg-red-600 text-white' :
                                                        item.type === 'alert' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {item.itemType === 'poll' ? '📊 Poll' :
                                                        item.isAdminNotice ? '🚨 ADMIN NOTICE' :
                                                            item.type === 'alert' ? '⚠️ Alert' : '📢 Notice'}
                                                </span>
                                                {!item.isRead && userRole === 'volunteer' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">
                                                {item.itemType === 'poll' ? item.question : item.title}
                                            </h2>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-500 block">
                                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {item.itemType === 'notice' ? (
                                        <div className="relative z-10">
                                            {item.isAdminNotice && (
                                                <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-600">
                                                    <p className="text-red-700 font-bold text-sm">⚠️ Official Administration Notice</p>
                                                </div>
                                            )}
                                            <p className="text-gray-600 whitespace-pre-wrap mb-4">{item.content}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mt-4 relative z-10">
                                            {item.options.map((option, idx) => {
                                                const totalVotes = item.voters.length;
                                                const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;

                                                return (
                                                    <div key={idx} className="relative">
                                                        <button
                                                            onClick={() => handleVote(item._id, idx)}
                                                            className="w-full text-left p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors relative overflow-hidden"
                                                            style={{
                                                                background: `linear-gradient(to right, #e0f2fe ${percentage}%, transparent ${percentage}%)`
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-center relative z-10">
                                                                <span className="font-medium">{option.text}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm text-gray-600">{percentage}%</span>
                                                                    <span className="font-semibold">{option.votes} votes</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <p className="text-sm text-gray-500 mt-2 text-right">
                                                Total votes: {item.voters.length}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 relative z-10">
                                        <span className="text-sm text-gray-500">Posted by:</span>
                                        <span className="text-sm font-medium">
                                            {item.itemType === 'poll' ? item.organizer?.displayName : item.author?.displayName}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(item.itemType === 'poll' ? item.organizer?.role : item.author?.role)
                                            }`}>
                                            {(item.itemType === 'poll' ? item.organizer?.role : item.author?.role)?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Layout>
        </Suspense>
    );
};

export default Notices;
