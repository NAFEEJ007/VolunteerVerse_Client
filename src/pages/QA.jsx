import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import VolunteerLayout from '../components/VolunteerLayout';
import Swal from 'sweetalert2';
import { HiChevronDown, HiChevronUp, HiChatAlt2, HiTrash } from 'react-icons/hi';

const QA = () => {
    const { currentUser } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());
    const [newAnswers, setNewAnswers] = useState({});
    const [newComments, setNewComments] = useState({});

    async function fetchQuestions() {
        try {
            const response = await axios.get(`${getApiBase()}/api/questions`);
            setQuestions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            Swal.fire('Please Login', 'You need to be logged in to ask questions', 'warning');
            return;
        }

        try {
            const token = await currentUser.getIdToken();
            await axios.post(
                `${getApiBase()}/api/questions`,
                { question: newQuestion },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire('Success!', 'Your question has been submitted for approval', 'success');
            setNewQuestion('');
        } catch (error) {
            console.error('Error submitting question:', error);
            Swal.fire('Error', 'Failed to submit question', 'error');
        }
    };

    const handleAddAnswer = async (questionId) => {
        if (!currentUser) {
            Swal.fire('Please Login', 'You need to be logged in to answer', 'warning');
            return;
        }

        const answerText = newAnswers[questionId];
        if (!answerText) return;

        try {
            const token = await currentUser.getIdToken();
            await axios.post(
                `${getApiBase()}/api/questions/${questionId}/answers`,
                { text: answerText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire('Success!', 'Answer added', 'success');
            setNewAnswers({ ...newAnswers, [questionId]: '' });
            fetchQuestions();
        } catch (error) {
            console.error('Error adding answer:', error);
            Swal.fire('Error', 'Failed to add answer', 'error');
        }
    };

    const handleAddComment = async (questionId, answerId) => {
        if (!currentUser) {
            Swal.fire('Please Login', 'You need to be logged in to comment', 'warning');
            return;
        }

        const commentText = newComments[`${questionId}-${answerId}`];
        if (!commentText) return;

        try {
            const token = await currentUser.getIdToken();
            await axios.post(
                `${getApiBase()}/api/questions/${questionId}/answers/${answerId}/comments`,
                { text: commentText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire('Success!', 'Comment added', 'success');
            setNewComments({ ...newComments, [`${questionId}-${answerId}`]: '' });
            fetchQuestions();
        } catch (error) {
            console.error('Error adding comment:', error);
            Swal.fire('Error', 'Failed to add comment', 'error');
        }
    };

    const handleDeleteAnswer = async (questionId, answerId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = await currentUser.getIdToken();
                await axios.delete(`${getApiBase()}/api/questions/${questionId}/answers/${answerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Deleted!', 'Your answer has been deleted.', 'success');
                fetchQuestions();
            } catch (error) {
                console.error('Error deleting answer:', error);
                Swal.fire('Error', 'Failed to delete answer', 'error');
            }
        }
    };

    const handleDeleteComment = async (questionId, answerId, commentId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = await currentUser.getIdToken();
                await axios.delete(`${getApiBase()}/api/questions/${questionId}/answers/${answerId}/comments/${commentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Deleted!', 'Your comment has been deleted.', 'success');
                fetchQuestions();
            } catch (error) {
                console.error('Error deleting comment:', error);
                Swal.fire('Error', 'Failed to delete comment', 'error');
            }
        }
    };

    const toggleQuestion = (questionId) => {
        const newSet = new Set(expandedQuestions);
        if (newSet.has(questionId)) {
            newSet.delete(questionId);
        } else {
            newSet.add(questionId);
        }
        setExpandedQuestions(newSet);
    };

    return (
        <VolunteerLayout>
            <div>
                <h1 className="text-3xl font-bold mb-6">Q/A - Community Questions & Answers</h1>

                {/* Ask Question Section */}
                <div className="card mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>
                    <form onSubmit={handleSubmitQuestion}>
                        <textarea
                            className="input-field mb-4"
                            rows="4"
                            placeholder="Type your question here..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary">
                            Submit Question
                        </button>
                    </form>
                    <p className="text-sm text-gray-500 mt-2">
                        * Your question will be reviewed by organizers before being published
                    </p>
                </div>

                {/* Community Q/A Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Community Questions</h2>

                    {loading ? (
                        <div className="text-center py-8">Loading questions...</div>
                    ) : questions.length === 0 ? (
                        <div className="card text-center">
                            <p className="text-gray-600">No approved questions yet. Be the first to ask!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((question) => (
                                <div key={question._id} className="card">
                                    {/* Question */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
                                            <p className="text-sm text-gray-500">
                                                Asked by {question.author?.displayName || 'Anonymous'} on{' '}
                                                {new Date(question.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => toggleQuestion(question._id)}
                                            className="btn btn-outline text-sm ml-4 flex items-center gap-2"
                                        >
                                            <HiChatAlt2 className="text-lg" />
                                            <span>{question.answers?.length || 0} Answers</span>
                                            {expandedQuestions.has(question._id) ? <HiChevronUp /> : <HiChevronDown />}
                                        </button>
                                    </div>

                                    {/* Answers (Expanded) */}
                                    {expandedQuestions.has(question._id) && (
                                        <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                            {/* Existing Answers */}
                                            {question.answers?.map((answer) => (
                                                <div key={answer._id} className="mb-4 pb-4 border-b border-gray-100">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="mb-2">{answer.text}</p>
                                                            <p className="text-sm text-gray-500 mb-3">
                                                                Answered by {answer.author?.displayName || 'Anonymous'} on{' '}
                                                                {new Date(answer.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {currentUser && answer.author?.email === currentUser.email && (
                                                            <button
                                                                onClick={() => handleDeleteAnswer(question._id, answer._id)}
                                                                className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                                                title="Delete Answer"
                                                            >
                                                                <HiTrash className="text-lg" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Comments */}
                                                    {answer.comments && answer.comments.length > 0 && (
                                                        <div className="ml-4 space-y-2 mb-3">
                                                            {answer.comments.map((comment) => (
                                                                <div key={comment._id} className="bg-gray-50 p-2 rounded flex justify-between items-start group">
                                                                    <div>
                                                                        <p className="text-sm">{comment.text}</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            By {comment.author?.displayName || 'Anonymous'}
                                                                        </p>
                                                                    </div>
                                                                    {currentUser && comment.author?.email === currentUser.email && (
                                                                        <button
                                                                            onClick={() => handleDeleteComment(question._id, answer._id, comment._id)}
                                                                            className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                                            title="Delete Comment"
                                                                        >
                                                                            <HiTrash />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add Comment */}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            className="input-field text-sm"
                                                            placeholder="Add a comment..."
                                                            value={newComments[`${question._id}-${answer._id}`] || ''}
                                                            onChange={(e) =>
                                                                setNewComments({
                                                                    ...newComments,
                                                                    [`${question._id}-${answer._id}`]: e.target.value
                                                                })
                                                            }
                                                        />
                                                        <button
                                                            onClick={() => handleAddComment(question._id, answer._id)}
                                                            className="btn btn-outline text-sm"
                                                        >
                                                            Comment
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Answer */}
                                            <div className="mt-4">
                                                <textarea
                                                    className="input-field mb-2"
                                                    rows="3"
                                                    placeholder="Write your answer..."
                                                    value={newAnswers[question._id] || ''}
                                                    onChange={(e) =>
                                                        setNewAnswers({
                                                            ...newAnswers,
                                                            [question._id]: e.target.value
                                                        })
                                                    }
                                                />
                                                <button
                                                    onClick={() => handleAddAnswer(question._id)}
                                                    className="btn btn-primary text-sm"
                                                >
                                                    Add Answer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </VolunteerLayout>
    );
};

export default QA;
