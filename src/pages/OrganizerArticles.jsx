import React, { useState, useEffect } from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

const OrganizerArticles = () => {
    const [allArticles, setAllArticles] = useState([]);
    const [pendingArticles, setPendingArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'

    async function fetchArticles() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();

            const [allRes, pendingRes] = await Promise.all([
                axios.get(`${getApiBase()}/api/articles/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${getApiBase()}/api/articles/pending`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setAllArticles(allRes.data);
            setPendingArticles(pendingRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleApprove = async (id) => {
        try {
            const user = auth.currentUser;
            const token = await user.getIdToken();

            await axios.put(`${getApiBase()}/api/articles/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('Success', 'Article approved!', 'success');
            fetchArticles();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to approve article', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            const user = auth.currentUser;
            const token = await user.getIdToken();

            await axios.put(`${getApiBase()}/api/articles/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('Success', 'Article rejected', 'success');
            fetchArticles();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to reject article', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the article',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.delete(`${getApiBase()}/api/articles/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Deleted!', 'Article has been deleted.', 'success');
                fetchArticles();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete article', 'error');
            }
        }
    };

    const ArticleCard = ({ article, showActions = true }) => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-500">
                        By {article.author?.displayName || article.author?.email} • {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${article.status === 'approved' ? 'bg-green-100 text-green-800' :
                            article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {article.status.toUpperCase()}
                    </span>
                </div>
                {article.image && (
                    <img src={article.image} alt={article.title} className="w-24 h-24 object-cover rounded-md ml-4" />
                )}
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">{article.content}</p>

            {showActions && (
                <div className="flex gap-2">
                    {article.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleApprove(article._id)}
                                className="btn btn-primary text-sm"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(article._id)}
                                className="btn btn-outline text-sm"
                            >
                                Reject
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => handleDelete(article._id)}
                        className="btn bg-red-500 hover:bg-red-600 text-white text-sm ml-auto"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <OrganizerLayout>
                <div className="flex justify-center items-center h-screen">Loading...</div>
            </OrganizerLayout>
        );
    }

    return (
        <OrganizerLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Article Management</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-primary'
                            }`}
                    >
                        All Articles ({allArticles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'pending'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-primary'
                            }`}
                    >
                        Pending Approval ({pendingArticles.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'all' && (
                    <div>
                        {allArticles.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No articles found</p>
                        ) : (
                            allArticles.map(article => (
                                <ArticleCard key={article._id} article={article} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div>
                        {pendingArticles.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No pending articles</p>
                        ) : (
                            pendingArticles.map(article => (
                                <ArticleCard key={article._id} article={article} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </OrganizerLayout>
    );
};

export default OrganizerArticles;
