import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const BannedUser = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Fetch "Access Denied" animation from a reliable source
        fetch('https://assets10.lottiefiles.com/packages/lf20_w51pcehl.json')
            .then(response => response.json())
            .then(data => setAnimationData(data))
            .catch(error => console.error('Error loading animation:', error));
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="w-64 h-64 mx-auto mb-6">
                    {animationData ? (
                        <Lottie animationData={animationData} loop={true} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Loading animation...
                        </div>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-red-600 mb-4">Account Suspended</h1>
                <p className="text-gray-600 mb-8">
                    Your account has been suspended due to a violation of our community guidelines.
                    If you believe this is a mistake, please contact support.
                </p>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Logged in as: <span className="font-semibold">{currentUser?.email}</span>
                    </p>
                    <button
                        onClick={handleLogout}
                        className="btn btn-primary w-full"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannedUser;
