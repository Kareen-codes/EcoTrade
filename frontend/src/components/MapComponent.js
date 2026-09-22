import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ position, setPosition }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        // Create the map only once when the component mounts
        mapRef.current = L.map('map').setView(position, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        // Set up the marker and make it draggable
        markerRef.current = L.marker(position, { draggable: true }).addTo(mapRef.current);

        // Update coordinates when the marker is dragged
        markerRef.current.on('dragend', () => {
            const { lat, lng } = markerRef.current.getLatLng();
            setPosition([lat, lng]);
        });

        // Update coordinates when the map is clicked
        mapRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            markerRef.current.setLatLng([lat, lng]);
        });

        return () => {
            mapRef.current.remove();
        };
    }, [setPosition, position]);

    useEffect(() => {
        if (mapRef.current && markerRef.current) {
            // Update the view and marker position when the location changes
            mapRef.current.setView(position, mapRef.current.getZoom());
            markerRef.current.setLatLng(position);
        }
    }, [position]);

    return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
};

export default MapComponent;
