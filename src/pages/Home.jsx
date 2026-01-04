import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
                const response = await axios.get(`${API_BASE.replace(/\/+$/,'')}/api/events`);
            setEvents(response.data.slice(0, 3)); // Show only 3 events on homepage
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    const handleGetStarted = () => {
        if (currentUser) {
            navigate('/volunteer/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="-mt-8">
            {/* Hero Section */}
            <div
                className="relative h-[600px] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(30, 58, 138, 0.75)), url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200')`,
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in !text-white drop-shadow-lg">
                            Welcome to VolunteerVerse
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto !text-white font-semibold drop-shadow-md">
                            Connect, Volunteer, and <span className="font-bold !text-white">Make a Difference</span> in Your Community
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={handleGetStarted}
                                className="btn btn-primary text-lg px-8 py-3 hover:scale-105 transition-transform"
                            >
                                Get Started
                            </button>
                            <Link
                                to="/volunteer/dashboard"
                                className="btn bg-white text-primary hover:bg-slate-100 border-2 border-white text-lg px-8 py-3 font-semibold"
                            >
                                Browse Events
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Volunteer with Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                🤝
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Make an Impact</h3>
                            <p className="text-gray-600">
                                Contribute to meaningful causes and see the direct impact of your efforts
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                🌟
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Gain Experience</h3>
                            <p className="text-gray-600">
                                Develop new skills and build your resume through volunteer work
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                💖
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Connect</h3>
                            <p className="text-gray-600">
                                Meet like-minded people and build lasting relationships
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Events Section */}
            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Featured Events</h2>
                        <Link to="/volunteer/dashboard" className="text-primary hover:underline">
                            View All Events →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No events available</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <div key={event._id} className="card hover:shadow-xl transition-shadow">
                                    {event.image && (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                                        />
                                    )}
                                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>

                                    <div className="space-y-1 mb-4 text-sm text-gray-700">
                                        {event.date && (
                                            <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                                        )}
                                        {event.location && (
                                            <p>📍 {event.location}</p>
                                        )}
                                    </div>

                                    <Link
                                        to="/volunteer/dashboard"
                                        className="w-full btn btn-primary text-center block"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-extrabold mb-4 !text-white">Ready to Make a Difference?</h2>
                    <p className="text-xl mb-8 !text-white font-semibold">Join thousands of <span className="font-bold !text-white">volunteers</span> making an impact <span className="font-bold !text-white">today</span></p>
                    {!currentUser && (
                        <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
                            Sign Up Now
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
