import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import bannedAnimation from '../assets/banned.json';

const BannedPage = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to home if user is not logged in
        if (!currentUser) {
            navigate('/', { replace: true });
        }
    }, [currentUser, navigate]);

    // Derive roleText directly
    const roleText = userRole === 'organizer' ? 'Organizer' : userRole === 'volunteer' ? 'Volunteer' : 'User';

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
                <div className="mb-6">
                    <Lottie
                        animationData={bannedAnimation}
                        className="mx-auto"
                        style={{ height: '180px', width: '180px' }}
                        loop
                        autoplay
                    />
                </div>

                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    {roleText} is Banned
                </h1>

                <p className="text-gray-600 mb-6">
                    Your account has been suspended by the administrator.
                    You no longer have access to the VolunteerVerse platform.
                </p>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-sm text-red-700">
                        <strong>Account Status:</strong> Banned
                    </p>
                    <p className="text-sm text-red-700 mt-2">
                        <strong>Email:</strong> {currentUser?.email}
                    </p>
                </div>

                <p className="text-sm text-gray-500">
                    If you believe this is a mistake, please contact the administrator.
                </p>
            </div>
        </div>
    );
};

export default BannedPage;
