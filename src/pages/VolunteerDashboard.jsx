import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import EventCard from '../components/EventCard';
import VolunteerLayout from '../components/VolunteerLayout';

const VolunteerDashboard = () => {
    useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200',
            title: 'Make a Difference',
            subtitle: 'Join our community of volunteers and create positive change'
        },
        {
            image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200',
            title: 'Volunteer Today',
            subtitle: 'Discover events and opportunities that match your passion'
        },
        {
            image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200',
            title: 'Build Community',
            subtitle: 'Connect with like-minded people and grow together'
        }
    ];

    async function fetchEvents() {
        try {
            const response = await axios.get(`${getApiBase()}/api/events`);
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvents();

        // Auto-advance slideshow every 5 seconds
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    if (loading) {
        return <div className="text-center py-8">Loading events...</div>;
    }

    return (
        <VolunteerLayout>
            <div>
                {/* Hero Banner with Slideshow */}
                <div className="relative h-96 mb-8 -mt-8 overflow-hidden rounded-lg">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slide.image}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="flex items-center justify-center h-full text-white text-center px-4">
                                <div>
                                    <h1 className="text-5xl font-bold mb-4 !text-white">{slide.title}</h1>
                                    <p className="text-xl !text-white">{slide.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Slide Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all"
                    >
                        →
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-6">Available Events</h1>

                {events.length === 0 ? (
                    <div className="card text-center">
                        <p className="text-gray-600">No events available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                onJoin={fetchEvents}
                                showJoinButton={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </VolunteerLayout>
    );
};

export default VolunteerDashboard;
