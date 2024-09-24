import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerCluster from './MarkerCluster'; // Custom MarkerCluster component
import './MapPage.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

// Bounding box coordinates for Osun State (approximate)
const osunBounds = [
  [6.7599, 3.7389], // New Southwest corner
  [8.0901, 5.6111], // New Northeast corner
];


const MapPage = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [userLocation, setUserLocation] = useState([7.562, 4.562]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [activeLayer, setActiveLayer] = useState('default');
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [facilitySidebarOpen, setFacilitySidebarOpen] = useState(false);
  const navigate = useNavigate();
  const mapRef = useRef();

  // Fetch GeoJSON point data from public folder
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/points.geojson'); // Ensure this path is correct
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeojsonData(data);
      } catch (err) {
        console.error("Error loading GeoJSON: ", err);
      }
    };
    fetchGeoJSON();
  }, []);

  // Fetch GeoJSON layers from public folder
  const [boundaryData, setBoundaryData] = useState(null);
  const [bufferData, setBufferData] = useState(null);

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const boundaryResponse = await fetch('/osunboundary2.geojson');
        const boundaryData = await boundaryResponse.json();
        setBoundaryData(boundaryData);

        const bufferResponse = await fetch('/bufferzone.geojson');
        const bufferData = await bufferResponse.json();
        setBufferData(bufferData);
      } catch (err) {
        console.error("Error loading layers GeoJSON: ", err);
      }
    };
    fetchLayers();
  }, []);

  // Get user's current location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation([lat, lon]);
        });
      }
    };
    getLocation();
  }, []);

  const getMarkerIcon = (facility) => {
    const colors = {
      private_primary: 'orange',
      public_primary: 'green',
      private_secondary: 'blue',
      public_secondary: 'red',
    };

    const key = `${facility.ownership}_${facility.facility_l}`;
    const color = colors[key] || 'gray';

    return L.divIcon({
      html: `<div class="fa-icon-marker"><i class="fa fa-map-marker fa-2x" style="color: ${color};"></i></div>`,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      popupAnchor: [0, -15],
    });
  };

  const tileLayerURLs = {
    default: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    satellite: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const onEachFeature = (feature, layer) => {
    layer.on('click', () => {
      setSelectedFacility(feature.properties);
    });
  };

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      const searchTerm = e.target.value.trim().toLowerCase();
      const facility = geojsonData.features.find(
        (f) => f.properties.facility_n.toLowerCase() === searchTerm
      );

      if (facility) {
        const latlng = [facility.geometry.coordinates[1], facility.geometry.coordinates[0]];
        mapRef.current.flyTo(latlng, 16);
      } else {
        alert('Facility not found');
      }
    }
  };

 // Function to filter facilities based on type
 const filterFacilities = (facilityType) => {
  fetch('/points.geojson')
    .then((response) => response.json())
    .then((data) => {
      console.log('Fetched data:', data); // Log the fetched data
      console.log('Features:', data.features); // Log the features array

      // Convert facilityType to the correct case for comparison
      const facilities = data.features.filter((feature) => 
        feature.properties.facility_l.toLowerCase() === facilityType.toLowerCase()
      ).map((feature) => ({
        uid: feature.uid,
        name: feature.properties.facility_n,
        coordinates: feature.geometry.coordinates,
      }));

      console.log('Filtered facilities:', facilities); // Log the filtered facilities

      setFilteredFacilities(facilities);
      setFacilitySidebarOpen(facilities.length > 0); // Open the sidebar only if there are facilities
    })
    .catch((error) => console.error('Error fetching facilities:', error));
};

  // Function to pan the map to the clicked facility location
  const panToLocation = (coordinates) => {
    if (mapRef.current) {
      mapRef.current.panTo([coordinates[1], coordinates[0]]);
    }
    setFacilitySidebarOpen(false);
  };
  const markers = geojsonData ? geojsonData.features.map((feature) => {
    const { properties, geometry } = feature;
    const [longitude, latitude] = geometry.coordinates;
  
    // Destructure the necessary properties
    const {
      facility_n, // Facility Name
      operation,  // Status
      facility_L, // Level
      ownership,  // Ownership
      LGA         // Local Government Area
    } = properties;
  
    // Create a formatted popup content string
    const popupContent = `
      <strong>Facility Name:</strong> ${facility_n || 'N/A'}<br>
      <strong>Status:</strong> ${operation || 'N/A'}<br>
      <strong>Level:</strong> ${facility_L || 'N/A'}<br>
      <strong>Ownership:</strong> ${ownership || 'N/A'}<br>
      <strong>LGA:</strong> ${LGA || 'N/A'}
    `;
  
    return {
      position: [latitude, longitude],
      popupContent: popupContent, // Use the formatted popup content
    };
  }) : [];
  

  return (
    <div className="map-page">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
          {sidebarOpen ? '<' : '>'}
        </button>

        <div className="sidebar-content">
          <h3>
            <i className="fas fa-map-marker-alt" /> User Location
          </h3>
          <p className="location-text">
            Latitude: {userLocation[0].toFixed(5)}, Longitude: {userLocation[1].toFixed(5)}
          </p>

          <h3 className="layer-header">Map Layers</h3>
          <button onClick={() => setActiveLayer('default')} className="sidebar-button">
            <i className="fas fa-map" /> Default View
          </button>
          <button onClick={() => setActiveLayer('satellite')} className="sidebar-button">
            <i className="fas fa-globe" /> Satellite View
          </button>
          <button onClick={() => setActiveLayer('boundary')} className="sidebar-button">
            <i className="fas fa-border-all" /> Osun State Boundary
          </button>
          <button onClick={() => setActiveLayer('buffer')} className="sidebar-button">
            <i className="fas fa-circle" /> 5km Buffer Zone
          </button>
          <button onClick={() => setActiveLayer('heatmap')} className="sidebar-button">
            <i className="fas fa-fire" /> Health Facility Heatmap
          </button>

          <h3 className="filter-header">Filter Facilities</h3>
          <button onClick={() => filterFacilities('primary')} className="sidebar-button">
            <i className="fas fa-hospital" /> Primary Facilities
          </button>
          <button onClick={() => filterFacilities('secondary')} className="sidebar-button">
            <i className="fas fa-hospital-alt" /> Secondary Facilities
          </button>
          <button onClick={() => filterFacilities('private')} className="sidebar-button">
            <i className="fas fa-user-md" /> Private
          </button>
          <button onClick={() => filterFacilities('public')} className="sidebar-button">
            <i className="fas fa-user-friends" /> Public
          </button>
        </div>

        {/* Login Button at the Bottom */}
        <div className="sidebar-footer">
          <button onClick={() => navigate('/login')} className="login-signup-btn">
            Login / Signup
          </button>
          <p className="powered-by">
            <span style={{ color: '#007BFF', fontWeight: 'bold' }}>Powered by </span>
            <span style={{ color: '#28A745', fontWeight: 'bold' }}>Monarch</span>
          </p>
        </div>
      </div>

     {/* Hidden Sidebar for Filtered Facilities */}
<div className={`hidden-sidebar ${facilitySidebarOpen ? 'facility-sidebar-open' : ''}`}>
  {filteredFacilities.length > 0 ? (
    filteredFacilities.map((facility) => (
      <div key={facility.uid} onClick={() => panToLocation(facility.coordinates)} className="facility-item">
        <h3>{facility.name}</h3>
      </div>
    ))
  ) : (
    <p>No facilities found.</p>
  )}
</div>


      {/* Main Container */}
      <div className="map-and-ribbon">
        {/* Search and Filter Ribbon */}
        <div className="search-and-filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by facility name..."
              className="search-input"
              onKeyPress={handleSearchEnter}
            />
            <i className="fas fa-search search-icon" />
          </div>
        </div>

        {/* Map */}
        <MapContainer
          center={userLocation}
          zoom={10}
          bounds={osunBounds}
          ref={mapRef}
          style={{ height: '100vh', width: '100%' }}
        >
          {/* Tile Layer */}
          <TileLayer url={tileLayerURLs[activeLayer]} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />

          {/* Boundary Layer */}
          {activeLayer === 'boundary' && boundaryData && (
            <GeoJSON data={boundaryData} style={{ color: 'blue', weight: 2 }} />
          )}

          {/* Buffer Layer */}
          {activeLayer === 'buffer' && bufferData && (
            <GeoJSON data={bufferData} style={{ color: 'red', weight: 2 }} />
          )}

          {/* Heatmap Layer */}
          {activeLayer === 'heatmap' && geojsonData && (
            <GeoJSON data={geojsonData} pointToLayer={(feature, latlng) => {
              return L.circleMarker(latlng, { radius: 8, fillColor: 'orange', color: 'orange', fillOpacity: 0.5 });
            }} />
          )}

          {/* Facilities Layer */}
          {geojsonData && geojsonData.features && (
        <MarkerCluster markers={markers} />
      )}

        </MapContainer>
      </div>

      {/* Facility Detail Modal */}
      {selectedFacility &&  (
  <Modal facility={selectedFacility} onClose={() => setSelectedFacility(null)} />
)};

    </div>
  );
};

export default MapPage;
