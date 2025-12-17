import React, { useState } from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

const OrganizerDashboard = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        location: '',
        image: '',
        capacity: '',
        fundraiserLink: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire('Error', 'You must be logged in', 'error');
                return;
            }

            const token = await user.getIdToken();
            await axios.post(`${getApiBase()}/api/events`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Event submitted for admin approval',
                icon: 'success'
            });

            // Reset form
            setFormData({
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
        <OrganizerLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="relative h-96 mb-12 rounded-lg overflow-hidden shadow-lg">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="flex items-center justify-center h-full text-white text-center px-4">
                            <div>
                                <h1 className="text-5xl font-bold mb-4 text-white" style={{ color: 'white' }}>Lead with Purpose</h1>
                                <p className="text-xl mb-2">Organize Events. Inspire Volunteers. Make an Impact.</p>
                                <p className="text-lg opacity-90">Your leadership creates opportunities for positive change in the community</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Event Form */}
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Event</h2>
                    <p className="text-gray-600 mb-6">
                        Submit your event for admin approval. Once approved, it will be visible to all volunteers.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Beach Cleanup Drive"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Environment">Environment</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Community">Community Service</option>
                                    <option value="Animal Welfare">Animal Welfare</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe your event, what volunteers will do, and what impact it will have..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
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
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Sunny Beach, California"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fundraiser Link (Optional)
                            </label>
                            <input
                                type="url"
                                name="fundraiserLink"
                                value={formData.fundraiserLink}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="https://gofundme.com/..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary px-8 py-3 text-lg"
                            >
                                Submit Event for Approval
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your event will be reviewed by an admin before being published to volunteers.
                            You'll be notified once it's approved.
                        </p>
                    </div>
                </div>
            </div>
        </OrganizerLayout>
    );
};

export default OrganizerDashboard;
