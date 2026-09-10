import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const UserContact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/messages/send-message`, {
                customerName: name,
                email,
                message,
            });
            setSuccess(true);
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };



    const position = [33.5138, 36.2763];


    const icon = L.icon({
        iconUrl: '/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    return (
        <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Contact Us</h1>
            <p className="text-center text-gray-600 mb-4">
                If you have any questions or comments, feel free to reach out to us!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                    <div className="flex items-center mb-4">
                        <FaEnvelope className="text-blue-600 text-2xl mr-2" />
                        <a href="mailto:osama.bittar2@gmail.com" className="text-gray-800">osama.bittar2@gmail.com</a>
                    </div>
                    <div className="flex items-center mb-4">
                        <FaPhoneAlt className="text-blue-600 text-2xl mr-2" />
                        <span className="text-gray-800">00963932735606</span>
                    </div>
                    <div className="flex items-center mb-4">
                        <FaMapMarkerAlt className="text-blue-600 text-2xl mr-2" />
                        <span className="text-gray-800">Damascus, Syria</span>
                    </div>
                </div>

                <div className="h-60 rounded-lg shadow">
                    <MapContainer center={position} zoom={13} className="h-full">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={position} icon={icon}>
                            <Popup>
                                We are here in Damascus!
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email Address:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium">Your Message:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows="4"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        Send Message
                    </button>
                    {success && <p className="text-green-500 mt-2 text-center">Message sent successfully!</p>}
                </form>
            </div>
        </div>
    );
};


export default UserContact