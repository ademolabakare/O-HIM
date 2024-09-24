import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster'; // Importing the marker cluster library
//import CustomMarker from './CustomMarker'; // Import your custom marker

const MarkerCluster = ({ markers = [] }) => {
  const map = useMap();

  useEffect(() => {
    // Initialize marker cluster
    const markerClusterGroup = L.markerClusterGroup();

    // Check if markers is defined and is an array
    if (Array.isArray(markers)) {
      // Add markers to cluster group
      markers.forEach(({ position, popupContent }) => {
        // Create a custom marker
        const customIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', // Default Leaflet icon
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', // Shadow image
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });

        // Create a Leaflet marker with the custom icon
        const marker = L.marker(position, { icon: customIcon });
        if (popupContent) {
          marker.bindPopup(popupContent); // Bind popup if content is provided
        }

        // Add the marker to the cluster group
        markerClusterGroup.addLayer(marker);
      });
    }

    // Add the cluster group to the map
    map.addLayer(markerClusterGroup);

    // Cleanup the cluster group when the component is unmounted
    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, markers]);

  return null; // No JSX is returned since we are using Leaflet directly
};

export default MarkerCluster;
