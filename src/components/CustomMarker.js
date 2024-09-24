import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const customIcon = L.icon({
    iconUrl: 'https://img.icons8.com/ios-filled/50/000000/marker.png', // Live icon URL
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const CustomMarker = ({ position }) => {
    return (
        <Marker position={position} icon={customIcon}>
            {/* Optional: You can add a Popup or other features here */}
        </Marker>
    );
};

export default CustomMarker;
