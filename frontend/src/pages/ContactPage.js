import React, { useContext } from 'react';
import UserContext from '../context/UserContext';
import AdminContact from './admin/AdminContact';
import UserContact from './user/UserContact';

const ContactPage = () => {
    const { user } = useContext(UserContext);

    // Check login status
    if (!user) {
        return (<UserContact></UserContact>);
    }

    // Check role
    if (user.role === 'admin') {
        return (<AdminContact></AdminContact>);
    } else {
        return (<UserContact></UserContact>);
    }
};

export default ContactPage;
