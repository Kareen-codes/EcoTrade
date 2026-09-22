import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const UserContext = createContext();
// Use centralized API config with fallback to avoid 404 when env var is undefined
const API_URL = API_BASE_URL;
const SESSION_DURATION = 6 * 60 * 60 * 1000;

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to register the user
    const registerUser = async (userData) => {
        try {
            await axios.post(`${API_URL}/users/register`, userData);
        } catch (error) {
            // Re-throw the error to the calling component
            throw error;
        }
    };

    // Function to log the user in
    const loginUser = async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/users/login`, credentials);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('sessionStart', Date.now());
        } catch (error) {
            if (error.response && error.response.status === 401) {
                throw new Error('Login failed: incorrect credentials.');
            } else {
                throw new Error('An unexpected error occurred while logging in.');
            }
        }
    };

    // Function to log the user out
    const logoutUser = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('sessionStart');
        setUser(null);
    };

    // Function to check whether the session has expired
    const checkSessionExpiration = useCallback(() => {
        const sessionStart = localStorage.getItem('sessionStart');
        if (sessionStart && Date.now() - sessionStart > SESSION_DURATION) {
            logoutUser();
            alert("Your session has expired. Please log in again.");
        }
    }, []);

    // Function to fetch user data
    const fetchUserProfile = async (userId) => {
        try {
            checkSessionExpiration();
            const response = await axios.get(`${API_URL}/users/profile/${userId}`);
            setUser(response.data.user);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    // Function to update user data
    const updateUser = async (userId, updatedData) => {
        try {
            checkSessionExpiration();
            await axios.put(`${API_URL}/users/profile/${userId}`, updatedData);
        } catch (error) {
            console.error("Failed to update user data:", error);
            throw error;
        }
    };

    // Function to delete the user
    const deleteUser = async (userId) => {
        try {
            checkSessionExpiration();
            await axios.delete(`${API_URL}/users/profile/${userId}`);
        } catch (error) {
            console.error("Failed to delete the user:", error);
            throw error;
        }
    };

    // Effect to load the user from localStorage on mount and check session expiration
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            checkSessionExpiration();
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, [checkSessionExpiration]);

    return (
        <UserContext.Provider value={{
            user,
            loading,
            registerUser,
            loginUser,
            logoutUser,
            fetchUserProfile,
            updateUser,
            deleteUser,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
