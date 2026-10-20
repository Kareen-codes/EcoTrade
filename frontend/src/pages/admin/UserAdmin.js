import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../../context/UserContext';
import AddUserPopup from '../../models/AddUserPopup';
import DeleteUserModal from '../../models/DeleteUserModal';
import { API_BASE_URL, getServerUrl } from '../../config/api';
import {
    UsersIcon,
    UserAddIcon,
    SearchIcon,
    XIcon,
    PencilIcon,
    TrashIcon,
    ExclamationCircleIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    RefreshIcon,
} from '@heroicons/react/outline';

/**
 * Format date to Gregorian format for display
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Get user initials for avatar fallback
 */
const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const UserAdmin = () => {
    const { registerUser, deleteUser, updateUser, user } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users/users`);
            const data = await response.json();
            if (data && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                setError('The received data is invalid');
            }
        } catch (err) {
            setError('An error occurred while fetching users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setDeleteModal({ isOpen: false, user: null });
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while deleting the user.');
        }
    };

    const handleAddUser = async (userData) => {
        await registerUser(userData);
        const response = await fetch(`${API_BASE_URL}/users/users`);
        const data = await response.json();
        if (data && Array.isArray(data.users)) {
            setUsers(data.users);
        } else {
            setError('The received data is invalid');
        }
    };

    const handleEditUser = async (userData) => {
        await updateUser(userToEdit.id, userData);
        setUsers((prev) =>
            prev.map((u) => (u.id === userToEdit.id ? { ...u, ...userData } : u))
        );
        setUserToEdit(null);
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
            roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === 'admin').length,
        regular: users.filter((u) => u.role === 'user').length,
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="h-10 w-48 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow p-6 animate-pulse">
                            <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
                            <div className="h-10 w-16 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="p-6 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state with retry
    if (error && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-50">
                        <ExclamationCircleIcon className="w-8 h-8 text-red-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">An error occurred</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchUsers}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                    >
                        <RefreshIcon className="w-5 h-5" strokeWidth={2} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {user && user.role === 'admin' ? (
                <>
                    {/* Page header */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 animate-fadeIn">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                    Manage Users
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    View and manage all platform users
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1 sm:min-w-[200px]">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                            aria-label="Clear search"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                {/* Role filter */}
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                                {/* Add user button */}
                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setUserToEdit(null);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
                                >
                                    <UserAddIcon className="w-5 h-5" strokeWidth={2} />
                                    Add User
                                </button>
                            </div>
                        </div>
                        {error && users.length > 0 && (
                            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-50">
                                    <UsersIcon className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-amber-500 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-50">
                                    <ShieldCheckIcon className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Admins</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-emerald-500 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-50">
                                    <UserCircleIcon className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.regular}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AddUserPopup
                        isOpen={showForm}
                        onClose={() => {
                            setShowForm(false);
                            setUserToEdit(null);
                        }}
                        onSubmit={userToEdit ? handleEditUser : handleAddUser}
                        userToEdit={userToEdit}
                    />

                    <DeleteUserModal
                        isOpen={deleteModal.isOpen}
                        userName={deleteModal.user?.name}
                        onConfirm={() => deleteModal.user && handleDeleteUser(deleteModal.user.id)}
                        onCancel={() => setDeleteModal({ isOpen: false, user: null })}
                    />

                    {filteredUsers.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-fadeIn">
                            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gray-100">
                                <UsersIcon className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                {searchTerm || roleFilter !== 'all'
                                    ? 'No users match the search or filter.'
                                    : 'No users have been added yet. Click "Add User" to get started.'}
                            </p>
                            {(searchTerm || roleFilter !== 'all') ? (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setRoleFilter('all');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Reset Search
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                                >
                                    <UserAddIcon className="w-5 h-5" strokeWidth={2} />
                                    Add User
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
                                <div className="overflow-x-auto scrollbar-thin">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Photo</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex justify-center">
                                                            {u.profileImage ? (
                                                                <img
                                                                    loading="lazy"
                                                                    src={getServerUrl(u.profileImage)}
                                                                    alt={u.name}
                                                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow"
                                                                />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow">
                                                                    {getInitials(u.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-medium text-gray-900">{u.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                                        {u.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                                                u.role === 'admin'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-blue-50 text-blue-700'
                                                            }`}
                                                        >
                                                            {u.role === 'admin' ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                                        {formatDate(u.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={() => {
                                                                    setUserToEdit(u);
                                                                    setShowForm(true);
                                                                }}
                                                                className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="w-5 h-5" strokeWidth={2} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteModal({ isOpen: true, user: u })}
                                                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="w-5 h-5" strokeWidth={2} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden space-y-3 animate-fadeIn">
                                {filteredUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="bg-white rounded-2xl shadow p-4 border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-4">
                                            {u.profileImage ? (
                                                <img
                                                    src={getServerUrl(u.profileImage)}
                                                    alt={u.name}
                                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {getInitials(u.name)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{u.name}</h3>
                                                <p className="text-sm text-gray-500 truncate">{u.email}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                            u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        {u.role === 'admin' ? 'Admin' : 'User'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setUserToEdit(u);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                                                >
                                                    <PencilIcon className="w-5 h-5" strokeWidth={2} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, user: u })}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                                >
                                                    <TrashIcon className="w-5 h-5" strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center animate-fadeIn">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-50">
                            <ExclamationCircleIcon className="w-8 h-8 text-red-600" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Insufficient Permissions</h3>
                        <p className="text-gray-600">You must be an admin to access this page</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAdmin;
