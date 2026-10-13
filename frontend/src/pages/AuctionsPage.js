import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext'; // Import the context
import AdminComponent from '../pages/admin/AdminAuction'; // Import the admin component
import UserComponent from '../pages/user/UserAuction'; // Import the regular user component

const AuctionsPage = () => {
    const { user } = useContext(UserContext); // Use the context to get user info

    return (
        <div className="">
            {user ? ( // Check if there is a logged-in user
                user.role === 'admin' ? ( // Check if the user is an admin
                    <AdminComponent /> // Show the admin component
                ) : (
                    <UserComponent /> // Show the regular user component
                )
            ) : (
                <div className="text-center p-6">
                    <p className="text-lg mb-4">No user is logged in, please log in.</p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Log in
                        </Link>
                        <span>or</span>
                        <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Create account
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuctionsPage;
