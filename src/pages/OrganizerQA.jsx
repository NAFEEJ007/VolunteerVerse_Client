import React, { useState, useEffect } from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

const OrganizerQA = () => {
    const [allQuestions, setAllQuestions] = useState([]);
    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();

            const [allRes, pendingRes] = await Promise.all([
                axios.get(`${getApiBase()}/api/questions/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${getApiBase()}/api/questions/pending`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setAllQuestions(allRes.data);
            setPendingQuestions(pendingRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const user = auth.currentUser;
            const token = await user.getIdToken();

            await axios.put(`${getApiBase()}/api/questions/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('Success', 'Question approved!', 'success');
            fetchQuestions();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to approve question', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            const user = auth.currentUser;
            const token = await user.getIdToken();

            await axios.put(`${getApiBase()}/api/questions/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('Success', 'Question rejected', 'success');
            fetchQuestions();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to reject question', 'error');
        }
    };

    const handleDeleteQuestion = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the question and all its answers',
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

                await axios.delete(`${getApiBase()}/api/questions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Deleted!', 'Question has been deleted.', 'success');
                fetchQuestions();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete question', 'error');
            }
        }
    };

    const handleDeleteAnswer = async (questionId, answerId) => {
        const result = await Swal.fire({
            title: 'Delete Answer?',
            text: 'This will permanently delete this answer and all its comments',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.delete(`${getApiBase()}/api/questions/${questionId}/answers/${answerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Deleted!', 'Answer has been deleted.', 'success');
                fetchQuestions();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete answer', 'error');
            }
        }
    };

    const handleDeleteComment = async (questionId, answerId, commentId) => {
        const result = await Swal.fire({
            title: 'Delete Comment?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const user = auth.currentUser;
                const token = await user.getIdToken();

                await axios.delete(`${getApiBase()}/api/questions/${questionId}/answers/${answerId}/comments/${commentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
                fetchQuestions();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete comment', 'error');
            }
        }
    };

    const QuestionCard = ({ question }) => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{question.question}</h3>
                    <p className="text-sm text-gray-500">
                        By {question.author?.displayName || question.author?.email} • {new Date(question.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${question.status === 'approved' ? 'bg-green-100 text-green-800' :
                            question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {question.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Answers */}
            {question.answers && question.answers.length > 0 && (
                <div className="ml-4 mt-4 space-y-3">
                    <h4 className="font-semibold text-gray-700">Answers ({question.answers.length})</h4>
                    {question.answers.map(answer => (
                        <div key={answer._id} className="bg-gray-50 rounded-md p-4">
                            <p className="text-gray-700 mb-2">{answer.text}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                    By {answer.author?.displayName || answer.author?.email}
                                </p>
                                <button
                                    onClick={() => handleDeleteAnswer(question._id, answer._id)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    Delete Answer
                                </button>
                            </div>

                            {/* Comments */}
                            {answer.comments && answer.comments.length > 0 && (
                                <div className="ml-4 mt-2 space-y-2">
                                    {answer.comments.map(comment => (
                                        <div key={comment._id} className="bg-white rounded p-2 text-sm">
                                            <p className="text-gray-600">{comment.text}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-400">
                                                    {comment.author?.displayName || comment.author?.email}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteComment(question._id, answer._id, comment._id)}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
                {question.status === 'pending' && (
                    <>
                        <button
                            onClick={() => handleApprove(question._id)}
                            className="btn btn-primary text-sm"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(question._id)}
                            className="btn btn-outline text-sm"
                        >
                            Reject
                        </button>
                    </>
                )}
                <button
                    onClick={() => handleDeleteQuestion(question._id)}
                    className="btn bg-red-500 hover:bg-red-600 text-white text-sm ml-auto"
                >
                    Delete Question
                </button>
            </div>
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
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Q/A Management</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-primary'
                            }`}
                    >
                        All Questions ({allQuestions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'pending'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-primary'
                            }`}
                    >
                        Pending Approval ({pendingQuestions.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'all' && (
                    <div>
                        {allQuestions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No questions found</p>
                        ) : (
                            allQuestions.map(question => (
                                <QuestionCard key={question._id} question={question} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div>
                        {pendingQuestions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No pending questions</p>
                        ) : (
                            pendingQuestions.map(question => (
                                <QuestionCard key={question._id} question={question} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </OrganizerLayout>
    );
};

export default OrganizerQA;
