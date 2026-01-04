import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Fetch "404 Not Found" animation from a reliable source
        fetch('https://assets5.lottiefiles.com/packages/lf20_kjixtysj.json')
            .then(response => response.json())
            .then(data => setAnimationData(data))
            .catch(error => console.error('Error loading animation:', error));
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg w-full text-center">
                <div className="w-full max-w-md mx-auto mb-8">
                    {animationData ? (
                        <Lottie animationData={animationData} loop={true} />
                    ) : (
                        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
                    )}
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Oops! The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="btn btn-primary text-lg px-8 py-3 hover:scale-105 transition-transform inline-block"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
