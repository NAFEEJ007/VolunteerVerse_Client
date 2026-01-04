import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import VolunteerLayout from '../components/VolunteerLayout';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get(`${getApiBase()}/api/gallery`);
            setImages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <VolunteerLayout>
                <div className="text-center py-8">Loading gallery...</div>
            </VolunteerLayout>
        );
    }

    return (
        <VolunteerLayout>
            <div>
                <h1 className="text-3xl font-bold mb-6">Event Gallery</h1>

                {images.length === 0 ? (
                    <div className="card text-center">
                        <p className="text-gray-600">No images in gallery yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => (
                            <div key={image._id} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow bg-gray-200">
                                <img
                                    src={image.imageUrl}
                                    alt={image.caption || 'Gallery image'}
                                    className="w-full h-64 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <div className="text-white w-full">
                                        {image.caption && (
                                            <p className="font-semibold mb-1">{image.caption}</p>
                                        )}
                                        {image.event && (
                                            <p className="text-sm">Event: {image.event.title}</p>
                                        )}
                                        <p className="text-xs text-gray-300">
                                            By {image.uploader?.displayName || 'Organizer'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </VolunteerLayout>
    );
};

export default Gallery;
