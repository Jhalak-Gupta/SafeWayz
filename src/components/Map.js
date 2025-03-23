import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import './Map.css'; 

const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", 
    iconSize: [30, 30], 
    iconAnchor: [16, 42], 
    popupAnchor: [0, -40], 
});

const ChangeView = ({ route }) => {
    const map = useMap();
    
    useEffect(() => {
        if (route.length > 0) {
            const bounds = route.map((point) => [point.lat, point.lon]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    return null;
};

const Map = ({ route }) => {
    const filteredMarkers = route.filter((_, index) => 
        index === 0 || index === route.length - 1 || index % 20 === 0
    );

    return (
        <div className="map-container">
            <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ height: "400px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeView route={route} /> 
                
                {route.length > 0 && (
                    <Polyline positions={route.map((point) => [point.lat, point.lon])} color="blue" />
                )}

                {filteredMarkers.map((point, index) => (
                    <Marker key={index} position={[point.lat, point.lon]} icon={customIcon}>
                        <Popup>Safety Score: {point.safety_score}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;