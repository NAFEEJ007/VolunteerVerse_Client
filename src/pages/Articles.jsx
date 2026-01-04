import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import VolunteerLayout from '../components/VolunteerLayout';
import { useAuth } from '../context/AuthContext';
import { HiUser, HiCalendar, HiBookOpen, HiX, HiPencilAlt } from 'react-icons/hi';
import Swal from 'sweetalert2';

const Articles = () => {
    const { currentUser } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [joinedEvents, setJoinedEvents] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        event: '',
        image: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchArticles();
        if (currentUser) {
            fetchJoinedEvents();
        }
    }, [currentUser]);

    const fetchArticles = async () => {
        try {
            const response = await axios.get(`${getApiBase()}/api/articles`);
            setArticles(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    const fetchJoinedEvents = async () => {
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/my-events/joined`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJoinedEvents(response.data);
        } catch (error) {
            console.error('Error fetching joined events:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content || !formData.event) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }

        setSubmitting(true);
        try {
            const token = await currentUser.getIdToken();
            await axios.post(
                `${getApiBase()}/api/articles`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                icon: 'success',
                title: 'Article Submitted!',
                text: 'Your article has been submitted for approval by organizers',
                confirmButtonColor: '#4F46E5'
            });

            // Reset form
            setFormData({ title: '', content: '', event: '', image: '' });
            setShowSubmitForm(false);
        } catch (error) {
            console.error('Error submitting article:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Failed to submit article',
                confirmButtonColor: '#4F46E5'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <VolunteerLayout>
                <div className="text-center py-8">Loading articles...</div>
            </VolunteerLayout>
        );
    }

    return (
        <VolunteerLayout>
            <div>
                {/* Header with Submit Button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Articles</h1>
                    {currentUser && (
                        <button
                            onClick={() => setShowSubmitForm(!showSubmitForm)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <HiPencilAlt />
                            {showSubmitForm ? 'Cancel' : 'Write Article'}
                        </button>
                    )}
                </div>

                {/* Article Submission Form */}
                {showSubmitForm && (
                    <div className="card mb-8 bg-blue-50 border-2 border-primary">
                        <h2 className="text-2xl font-semibold mb-4">Submit Your Article</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Volunteer Name (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={currentUser?.displayName || currentUser?.email || 'Anonymous'}
                                    disabled
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Article Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Article Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter article title"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Event Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Event <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.event}
                                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="">-- Choose an event you joined --</option>
                                    {joinedEvents.map((event) => (
                                        <option key={event._id} value={event._id}>
                                            {event.title}
                                        </option>
                                    ))}
                                </select>
                                {joinedEvents.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        You need to join an event before writing an article
                                    </p>
                                )}
                            </div>

                            {/* Article Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Write Your Article <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Share your experience, thoughts, or story about the event..."
                                    rows="8"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Optional Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitForm(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || joinedEvents.length === 0}
                                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Post Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Articles Grid */}
                {articles.length === 0 ? (
                    <div className="card text-center">
                        <p className="text-gray-600">No articles available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <div key={article._id} className="card hover:shadow-xl transition-shadow">
                                {article.image && (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                                    />
                                )}
                                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                                <p className="text-gray-600 mb-3 line-clamp-2">{article.content}</p>

                                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <HiUser className="text-primary" />
                                        {article.author?.displayName || 'Anonymous'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HiCalendar className="text-primary" />
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <HiCalendar className="text-primary" />
                                        {new Date(article.createdAt).toLocaleTimeString()}
                                    </span>                                    

                                </div>

                                <button
                                    onClick={() => setSelectedArticle(article)}
                                    className="w-full btn btn-primary flex items-center justify-center gap-2"
                                >
                                    <HiBookOpen />
                                    Read More
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Article Modal */}
                {selectedArticle && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <HiX className="text-2xl" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {selectedArticle.image && (
                                    <img
                                        src={selectedArticle.image}
                                        alt={selectedArticle.title}
                                        className="w-full h-64 object-cover rounded-lg mb-6"
                                    />
                                )}

                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <HiUser className="text-primary" />
                                        <strong>Author:</strong> {selectedArticle.author?.displayName || 'Anonymous'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HiCalendar className="text-primary" />
                                        <strong>Published:</strong> {new Date(selectedArticle.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedArticle.content}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t px-6 py-4 flex justify-end">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="btn btn-outline"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </VolunteerLayout>
    );
};

export default Articles;
