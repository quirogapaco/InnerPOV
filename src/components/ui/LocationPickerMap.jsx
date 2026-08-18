import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2, AlertTriangle } from 'lucide-react';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Caché en memoria compartida entre instancias del componente (evita repetir la misma búsqueda)
const searchCache = new Map();
// Controla el ritmo global de peticiones a Nominatim (política: máx. ~1 req/seg)
let lastRequestAt = 0;
const MIN_REQUEST_INTERVAL_MS = 1100;

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.2 });
        }
    }, [center, map]);
    return null;
}

function LocationMarker({ position, onPositionChange }) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? (
        <Marker
            position={position}
            icon={customIcon}
            draggable={true}
            eventHandlers={{
                dragend(e) {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    onPositionChange(pos.lat, pos.lng);
                },
            }}
        />
    ) : null;
}

/**
 * Selector de coordenadas con buscador de direcciones.
 *
 * Props:
 * - address: texto de dirección/búsqueda actual (independiente del "nombre del lugar")
 * - latitude, longitude: coordenadas actuales
 * - onLocationChange({ address, latitude, longitude }): se llama al buscar, seleccionar o mover el pin
 */
export default function LocationPickerMap({
    address,
    latitude,
    longitude,
    onLocationChange,
}) {
    const defaultLat = latitude || -1.2491;
    const defaultLng = longitude || -78.6168;

    const [position, setPosition] = useState([defaultLat, defaultLng]);
    const [searchQuery, setSearchQuery] = useState(address || '');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState('');

    const debounceTimer = useRef(null);
    const throttleTimer = useRef(null);
    const abortControllerRef = useRef(null);
    const containerRef = useRef(null);
    const requestSeq = useRef(0);

    // Cierra el dropdown al hacer clic fuera del componente
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Limpieza de temporizadores/peticiones al desmontar
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            if (throttleTimer.current) clearTimeout(throttleTimer.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    const runSearch = useCallback(async (query) => {
        const normalized = query.trim().toLowerCase();

        // 1. Caché: evita repetir peticiones idénticas
        if (searchCache.has(normalized)) {
            setSearchResults(searchCache.get(normalized));
            setIsSearching(false);
            setSearchError('');
            return;
        }

        // 2. Cancela cualquier petición anterior en vuelo
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // 3. Throttle global: espera si la última petición fue muy reciente
        const now = Date.now();
        const elapsed = now - lastRequestAt;
        const waitTime = Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);

        const mySeq = ++requestSeq.current;

        const doFetch = async () => {
            lastRequestAt = Date.now();
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        query
                    )}&limit=5&addressdetails=1`,
                    {
                        headers: { 'Accept-Language': 'es' },
                        signal: controller.signal,
                    }
                );

                // Si mientras esperábamos el usuario lanzó otra búsqueda más nueva, descartamos esta respuesta
                if (mySeq !== requestSeq.current) return;

                if (response.status === 429) {
                    setSearchError('Demasiadas búsquedas seguidas. Espera unos segundos e intenta de nuevo.');
                    setSearchResults([]);
                    setIsSearching(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Error ${response.status}`);
                }

                const data = await response.json();
                searchCache.set(normalized, data || []);
                setSearchResults(data || []);
                setSearchError('');
            } catch (error) {
                if (error.name === 'AbortError') return; // cancelada intencionalmente, no es un error real
                console.error('Error buscando ubicación:', error);
                setSearchError('No se pudo buscar la ubicación. Intenta de nuevo.');
                setSearchResults([]);
            } finally {
                if (mySeq === requestSeq.current) setIsSearching(false);
            }
        };

        if (waitTime > 0) {
            throttleTimer.current = setTimeout(doFetch, waitTime);
        } else {
            doFetch();
        }
    }, []);

    const executeSearch = useCallback(
        (query) => {
            if (!query || query.trim().length < 3) {
                setSearchResults([]);
                setShowDropdown(false);
                setIsSearching(false);
                setSearchError('');
                return;
            }

            setIsSearching(true);
            setShowDropdown(true);
            setSearchError('');
            runSearch(query);
        },
        [runSearch]
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        onLocationChange({ address: value, latitude, longitude });

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        // Debounce más generoso (800ms) para reducir peticiones mientras el usuario escribe
        debounceTimer.current = setTimeout(() => {
            executeSearch(value);
        }, 800);
    };

    const handleSelectResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const name = result.display_name;

        setPosition([lat, lng]);
        setSearchQuery(name);
        setShowDropdown(false);

        onLocationChange({
            address: name,
            latitude: lat,
            longitude: lng,
        });
    };

    const handlePinMove = (lat, lng) => {
        setPosition([lat, lng]);
        onLocationChange({
            address: searchQuery || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            latitude: lat,
            longitude: lng,
        });
    };

    return (
        <div className="space-y-3" ref={containerRef}>
            {/* Buscador de dirección/coordenadas */}
            <div className="relative z-20">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar dirección o lugar (ej. Av. Guaytambos, Ambato)..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => searchQuery.length >= 3 && searchResults.length > 0 && setShowDropdown(true)}
                        className="w-full bg-[#F4F1EE] border-none rounded-xl p-4 font-sans text-sm text-[#1c1b1b] outline-none pr-12 focus:ring-1 focus:ring-black focus:bg-white transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                        {isSearching ? (
                            <Loader2 size={18} className="animate-spin text-black" />
                        ) : (
                            <Search size={18} />
                        )}
                    </div>
                </div>

                {/* Dropdown de resultados */}
                {showDropdown && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden max-h-60 overflow-y-auto z-50">
                        {searchResults.map((item) => (
                            <button
                                key={item.place_id}
                                type="button"
                                onClick={() => handleSelectResult(item)}
                                className="w-full px-4 py-3 text-left font-sans text-xs hover:bg-[#F4F1EE] transition-colors border-b border-neutral-100 last:border-none flex items-start gap-2.5"
                            >
                                <MapPin size={16} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                                <span className="text-black font-medium line-clamp-2">{item.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Mensaje de error (incluye 429) */}
                {showDropdown && !isSearching && searchError && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-red-100 z-50 px-4 py-3 flex items-start gap-2.5">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-red-500 font-sans text-xs">{searchError}</span>
                    </div>
                )}
            </div>

            {/* Mapa Interactivo */}
            <div className="relative h-64 w-full rounded-[24px] overflow-hidden border border-black/5 shadow-inner">
                <MapContainer
                    center={position}
                    zoom={14}
                    scrollWheelZoom={false}
                    touchZoom={true}       
                    dragging={true} 
                    className="h-full w-full z-10"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <RecenterMap center={position} />
                    <LocationMarker position={position} onPositionChange={handlePinMove} />
                </MapContainer>

                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 z-20 text-[10px] font-sans font-medium text-neutral-600 shadow-sm flex items-center gap-1.5">
                    <MapPin size={12} className="text-black" />
                    <span>
                        {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Haz clic en el mapa para fijar el punto'}
                    </span>
                </div>
            </div>
        </div>
    );
}