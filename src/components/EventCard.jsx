import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { HiStar, HiOutlineStar, HiFolder, HiCalendar, HiLocationMarker, HiUsers, HiCurrencyDollar } from 'react-icons/hi';

const EventCard = ({ event, onJoin, showJoinButton = true }) => {
    const { currentUser } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarking, setBookmarking] = useState(false);

    useEffect(() => {
        checkBookmarkStatus();
    }, [event._id, currentUser]);

    const checkBookmarkStatus = async () => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/bookmarks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const bookmarked = response.data.some(e => e._id === event._id);
            setIsBookmarked(bookmarked);
        } catch (error) {
            console.error('Error checking bookmark:', error);
        }
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Login',
                text: 'You need to be logged in to bookmark events',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }

        setBookmarking(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(
                `${getApiBase()}/api/bookmarks/${event._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setIsBookmarked(response.data.bookmarked);

            Swal.fire({
                icon: 'success',
                title: response.data.bookmarked ? 'Bookmarked!' : 'Bookmark Removed',
                text: response.data.message,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.response?.data?.message || 'Failed to bookmark event',
                confirmButtonColor: '#4F46E5'
            });
        } finally {
            setBookmarking(false);
        }
    };

    const handleJoinClick = async () => {
        console.log('Join button clicked for event:', event._id);
        
        if (!currentUser) {
            console.log('No user logged in');
            Swal.fire({
                icon: 'warning',
                title: 'Please Login',
                text: 'You need to be logged in to join events',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }

        try {
            console.log('Sending join request...');
            const token = await currentUser.getIdToken();
            console.log('Token obtained, making API call');
            
            const response = await axios.post(
                `${getApiBase()}/api/events/${event._id}/join`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Join request successful:', response.data);

            Swal.fire({
                icon: 'success',
                title: '✓ Request Sent!',
                text: 'Your join request has been sent to the organizer',
                confirmButtonColor: '#4F46E5'
            });

            if (onJoin) onJoin();
        } catch (error) {
            console.error('Error joining event:', error);
            console.error('Error details:', error.response?.data);
            console.error('Status code:', error.response?.status);
            console.error('Full error response:', error.response);
            
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.response?.data?.message || 'Failed to join event',
                confirmButtonColor: '#4F46E5'
            });
        }
    };

    const handleDonate = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Login',
                text: 'You need to be logged in to donate',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }

        const { value: amount } = await Swal.fire({
            title: 'Donate to Event',
            input: 'number',
            inputLabel: 'Enter donation amount ($)',
            inputPlaceholder: 'Amount',
            showCancelButton: true,
            confirmButtonText: 'Donate',
            confirmButtonColor: '#10B981',
            inputValidator: (value) => {
                if (!value || value <= 0) {
                    return 'Please enter a valid amount greater than 0';
                }
            }
        });

        if (amount) {
            try {
                const token = await currentUser.getIdToken();
                await axios.post(
                    `${getApiBase()}/api/events/${event._id}/donate`,
                    { amount },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Thank You!',
                    text: `You have successfully donated $${amount}`,
                    confirmButtonColor: '#10B981'
                });
            } catch (error) {
                console.error('Donation error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.response?.data?.message || 'Failed to process donation',
                    confirmButtonColor: '#4F46E5'
                });
            }
        }
    };

    return (
        <div className="card hover:shadow-xl transition-all duration-300 relative group flex flex-col h-full">
            {event.image && (
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                />
            )}

            <h3 className="text-xl font-semibold mb-2 pr-8">{event.title}</h3>
            <p className="text-gray-600 mb-3 line-clamp-2 flex-grow">{event.description}</p>

            <div className="space-y-2 mb-4 text-sm text-gray-700">
                {event.category && (
                    <p className="flex items-center gap-2">
                        <HiFolder className="text-primary" />
                        <span className="font-medium">Category:</span> {event.category}
                    </p>
                )}
                {event.date && (
                    <p className="flex items-center gap-2">
                        <HiCalendar className="text-primary" />
                        <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                    </p>
                )}
                {event.location && (
                    <p className="flex items-center gap-2">
                        <HiLocationMarker className="text-primary" />
                        <span className="font-medium">Location:</span> {event.location}
                    </p>
                )}
                {event.capacity && (
                    <p className="flex items-center gap-2">
                        <HiUsers className="text-primary" />
                        <span className="font-medium">Capacity:</span> {event.volunteers?.length || 0}/{event.capacity}
                    </p>
                )}
            </div>

            <div className="mt-auto space-y-2">
                {showJoinButton && (
                    <button
                        onClick={handleJoinClick}
                        className="w-full btn btn-primary"
                    >
                        Request to Join
                    </button>
                )}
                
                <div className="flex gap-2">
                    <button
                        onClick={handleBookmark}
                        disabled={bookmarking}
                        className={`flex-1 btn ${isBookmarked ? 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100' : 'btn-outline border-gray-300 hover:border-yellow-400 hover:text-yellow-500'} flex items-center justify-center gap-2 transition-colors`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                    >
                        {bookmarking ? (
                            <span className="animate-spin">⏳</span>
                        ) : isBookmarked ? (
                            <HiStar className="text-xl" />
                        ) : (
                            <HiOutlineStar className="text-xl" />
                        )}
                        {isBookmarked ? 'Saved' : 'Bookmark'}
                    </button>

                    <button
                        onClick={handleDonate}
                        className="flex-1 btn btn-outline border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 flex items-center justify-center gap-2 transition-colors"
                        title="Donate to this event"
                    >
                        <HiCurrencyDollar className="text-xl" />
                        Donate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
