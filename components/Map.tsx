
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tip, TransportMode, Coordinates } from '../types';

declare const L: any; // Declare Leaflet global

interface MapProps {
    tips: Tip[];
    activeTipId: number | null;
    onMarkerClick: (tipId: number) => void;
}

interface LocationPoint {
    coords: Coordinates;
    name: string;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
        case TransportMode.Taxi: return '🚕';
        case TransportMode.Bus: return '🚌';
        case TransportMode.Metro: return '🚇';
        case TransportMode.AutoRickshaw: return '🛺';
        case TransportMode.Train: return '🚆';
        case TransportMode.Ferry: return '⛴️';
        default: return '📍';
    }
};

const Map: React.FC<MapProps> = ({ tips, activeTipId, onMarkerClick }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const tipMarkersRef = useRef<{ [tipId: number]: any }>({});
    const startMarkerRef = useRef<any | null>(null);
    const endMarkerRef = useRef<any | null>(null);
    const routingControlRef = useRef<any | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [startPoint, setStartPoint] = useState<LocationPoint | null>(null);
    const [endPoint, setEndPoint] = useState<LocationPoint | null>(null);
    const [startQuery, setStartQuery] = useState('');
    const [endQuery, setEndQuery] = useState('');
    const [startSuggestions, setStartSuggestions] = useState<NominatimResult[]>([]);
    const [endSuggestions, setEndSuggestions] = useState<NominatimResult[]>([]);
    const [routeInfo, setRouteInfo] = useState<{distance: string; time: string} | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || typeof L === 'undefined' || mapInstance.current) {
            return;
        }
        mapInstance.current = L.map(mapRef.current, { center: { lat: 28.6139, lng: 77.2090 }, zoom: 11 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update tip markers
    useEffect(() => {
        if (!mapInstance.current) return;
        const currentMarkers = tipMarkersRef.current;
        const tipsWithCoords = tips.filter(tip => tip.coordinates);
        const tipIds = new Set(tipsWithCoords.map(tip => tip.id));

        Object.keys(currentMarkers).forEach(tipIdStr => {
            const tipId = parseInt(tipIdStr, 10);
            if (!tipIds.has(tipId)) {
                currentMarkers[tipId].remove();
                delete currentMarkers[tipId];
            }
        });

        tipsWithCoords.forEach(tip => {
            if (!tip.coordinates) return;
            const isActive = tip.id === activeTipId;
            const iconHtml = `<div class="marker-icon-container ${isActive ? 'active' : ''}"><div class="marker-icon-emoji">${getTransportIcon(tip.transportMode)}</div></div>`;
            const icon = L.divIcon({ html: iconHtml, className: 'custom-leaflet-div-icon', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16] });

            if (currentMarkers[tip.id]) {
                currentMarkers[tip.id].setIcon(icon);
            } else {
                const marker = L.marker(tip.coordinates, { icon }).addTo(mapInstance.current);
                const popupContent = `<div class="p-1"><div class="font-bold">${getTransportIcon(tip.transportMode)} ${tip.origin}</div><div class="text-sm text-text-secondary">To: ${tip.destination}</div><div class="text-sm mt-1">Cost: <span class="font-semibold text-secondary">${tip.estimatedCost}</span></div></div>`;
                marker.bindPopup(popupContent);
                marker.on('click', () => onMarkerClick(tip.id));
                tipMarkersRef.current[tip.id] = marker;
            }
        });
    }, [tips, activeTipId, onMarkerClick]);

    const createMarker = (point: LocationPoint, ref: React.MutableRefObject<any>, label: string, color: string) => {
        if (ref.current) ref.current.remove();
        if (point && mapInstance.current) {
            const icon = L.divIcon({
                html: `<div class="marker-icon-container" style="background-color: ${color};">${label}</div>`,
                className: 'custom-leaflet-div-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });
            ref.current = L.marker(point.coords, { icon }).addTo(mapInstance.current).bindPopup(point.name);
        }
    };
    
    useEffect(() => createMarker(startPoint, startMarkerRef, 'A', '#0d9488'), [startPoint]);
    useEffect(() => createMarker(endPoint, endMarkerRef, 'B', '#f97316'), [endPoint]);

    // Update route
    useEffect(() => {
        if (routingControlRef.current) mapInstance.current.removeControl(routingControlRef.current);
        if (startPoint && endPoint && mapInstance.current) {
            const routingControl = L.Routing.control({
                waypoints: [L.latLng(startPoint.coords.lat, startPoint.coords.lng), L.latLng(endPoint.coords.lat, endPoint.coords.lng)],
                routeWhileDragging: false, addWaypoints: false, createMarker: () => null,
                lineOptions: { styles: [{ color: '#f97316', opacity: 0.8, weight: 6 }] }
            }).on('routesfound', (e: any) => {
                const summary = e.routes[0].summary;
                const distance = (summary.totalDistance / 1000).toFixed(2) + ' km';
                const time = Math.round(summary.totalTime / 60) + ' minutes';
                setRouteInfo({ distance, time });
            }).addTo(mapInstance.current);
            routingControlRef.current = routingControl;
        } else {
            setRouteInfo(null);
        }
    }, [startPoint, endPoint]);

    const fetchSuggestions = async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<NominatimResult[]>>) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in`);
        const data = await response.json();
        setSuggestions(data);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
        const query = e.target.value;
        if (type === 'start') setStartQuery(query);
        else setEndQuery(query);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(query, type === 'start' ? setStartSuggestions : setEndSuggestions);
        }, 300);
    };
    
    const handleSuggestionClick = (suggestion: NominatimResult, type: 'start' | 'end') => {
        const point = { coords: { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) }, name: suggestion.display_name };
        if (type === 'start') {
            setStartPoint(point);
            setStartQuery(suggestion.display_name);
            setStartSuggestions([]);
        } else {
            setEndPoint(point);
            setEndQuery(suggestion.display_name);
            setEndSuggestions([]);
        }
        mapInstance.current.flyTo(point.coords, 14);
    };

    const handleGeolocate = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const point = { coords: { lat: latitude, lng: longitude }, name: "My Current Location" };
                setStartPoint(point);
                setStartQuery("My Current Location");
                mapInstance.current.flyTo(point.coords, 15);
            },
            (error) => console.error(`Geolocation error: ${error.message}`)
        );
    };
    
    const SuggestionList = ({ suggestions, onClick }: { suggestions: NominatimResult[], onClick: (s: NominatimResult) => void }) => (
        <div className="suggestions-container">
            {suggestions.map((s, i) => (
                <div key={i} className="suggestion-item" onClick={() => onClick(s)}>
                    {s.display_name}
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-surface rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">Plan a Route</h3>
            <div style={{ height: '500px' }} className="rounded-lg overflow-hidden relative" role="application">
                <div className="directions-panel">
                    <div className="directions-input-group">
                        <input type="text" value={startQuery} onChange={e => handleQueryChange(e, 'start')} placeholder="From: address or location" className="directions-input" />
                        <button onClick={handleGeolocate} className="geolocate-btn" aria-label="Use my location">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        </button>
                        {startSuggestions.length > 0 && <SuggestionList suggestions={startSuggestions} onClick={s => handleSuggestionClick(s, 'start')} />}
                    </div>
                    <div className="directions-input-group">
                        <input type="text" value={endQuery} onChange={e => handleQueryChange(e, 'end')} placeholder="To: address or location" className="directions-input" />
                        {endSuggestions.length > 0 && <SuggestionList suggestions={endSuggestions} onClick={s => handleSuggestionClick(s, 'end')} />}
                    </div>
                    {routeInfo && (
                        <div className="route-summary">
                            <p><strong>Distance:</strong> {routeInfo.distance}</p>
                            <p><strong>Time:</strong> {routeInfo.time}</p>
                        </div>
                    )}
                </div>
                <div ref={mapRef} className="h-full w-full bg-gray-200" />
            </div>
        </div>
    );
};

export default Map;