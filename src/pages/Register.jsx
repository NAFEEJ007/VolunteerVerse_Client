import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('volunteer');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { refreshUser, userRole } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (isRegistering && userRole === role) {
            if (role === 'volunteer') {
                navigate('/volunteer/dashboard');
            } else if (role === 'organizer') {
                navigate('/organizer/dashboard');
            } else {
                navigate('/');
            }
            setIsRegistering(false);
        }
    }, [userRole, role, isRegistering, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate username format (only letters and spaces for person names)
        const usernameRegex = /^[a-zA-Z\s]+$/;
        if (!usernameRegex.test(username)) {
            setError('Name can only contain letters and spaces (e.g., "John Doe")');
            return;
        }

        if (username.length < 2 || username.length > 50) {
            setError('Name must be between 2 and 50 characters');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Firebase profile with display name
            // This ensures the name is available immediately in the currentUser object
            const { updateProfile } = await import('firebase/auth');
            await updateProfile(user, {
                displayName: username
            });

            // Create user in MongoDB
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await axios.post(`${API_BASE.replace(/\/+$/, '')}/api/users`, {
                uid: user.uid,
                email: user.email,
                username: username,
                role: role,
                displayName: username
            });

            // Trigger refresh and enable navigation check
            setIsRegistering(true);
            await refreshUser();
        } catch (err) {
            setError('Failed to create account: ' + err.message);
            setIsRegistering(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="card">
                <h2 className="text-center mb-6">Sign Up</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your full name (e.g., John Doe)"
                            minLength={2}
                            maxLength={50}
                            pattern="[a-zA-Z\s]+"
                            title="Name can only contain letters and spaces"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">2-50 characters, letters and spaces only</p>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">I want to join as:</label>
                        <select
                            className="input-field"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="volunteer">Volunteer</option>
                            <option value="organizer">Organizer</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full btn btn-primary">Sign Up</button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
