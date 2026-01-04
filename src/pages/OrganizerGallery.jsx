import React, { useState, useEffect } from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

const OrganizerGallery = () => {
    const [images, setImages] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        event: '',
        uploadType: 'url' // 'url' or 'file'
    });



    async function fetchGallery() {
        try {
            const response = await axios.get(`${getApiBase()}/api/gallery`);
            setImages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setLoading(false);
        }
    }

    async function fetchEvents() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    useEffect(() => {
        fetchGallery();
        fetchEvents();
    }, []);

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

            // For now, we'll only support URL upload
            // File upload would require additional backend setup with multer
            await axios.post(`${getApiBase()}/api/gallery`, {
                url: formData.url,
                event: formData.event || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('Success', 'Image uploaded successfully!', 'success');
            setShowUploadForm(false);
            setFormData({ url: '', event: '', uploadType: 'url' });
            fetchGallery();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to upload image', 'error');
        }
    };

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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Gallery Management</h1>
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="btn btn-primary"
                    >
                        {showUploadForm ? 'Cancel' : '+ Upload Image'}
                    </button>
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4">Upload New Image</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL *
                                </label>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Associate with Event (Optional)
                                </label>
                                <select
                                    name="event"
                                    value={formData.event}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">No Event</option>
                                    {events.map(event => (
                                        <option key={event._id} value={event._id}>
                                            {event.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadForm(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Upload Image
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No images in gallery yet</p>
                            <p className="text-gray-400 text-sm mt-2">Upload your first image to get started</p>
                        </div>
                    ) : (
                        images.map((image) => (
                            <div key={image._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.event?.title || 'Gallery image'}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    {image.event && (
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            Event: {image.event.title}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Uploaded {new Date(image.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </OrganizerLayout>
    );
};

export default OrganizerGallery;
