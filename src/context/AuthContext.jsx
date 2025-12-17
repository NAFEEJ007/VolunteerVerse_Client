import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { getApiBase } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState(null);
    const [displayName, setDisplayName] = useState(null);
    const [isBanned, setIsBanned] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Fetch user role from backend
                try {
                    const token = await user.getIdToken();
                    const response = await axios.get(`${getApiBase()}/api/users/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUserRole(response.data.role);
                    setUsername(response.data.username);
                    setDisplayName(response.data.displayName);
                    setIsBanned(response.data.isBanned || false);
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    // Handle error (e.g., user not in DB yet)
                }
            } else {
                setUserRole(null);
                setUsername(null);
                setDisplayName(null);
                setIsBanned(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const refreshUser = async () => {
        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken(true);
                const response = await axios.get(`${getApiBase()}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserRole(response.data.role);
                setUsername(response.data.username);
                setDisplayName(response.data.displayName);
                setIsBanned(response.data.isBanned || false);
            } catch (error) {
                console.error("Error refreshing user role:", error);
            }
        }
    };

    const value = {
        currentUser,
        userRole,
        username,
        displayName,
        isBanned,
        loading,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
