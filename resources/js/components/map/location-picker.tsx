import { MapContainer, TileLayer, Marker, useMapEvents, Circle, CircleMarker } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

// Fix default marker icons
import "leaflet/dist/leaflet.css";
import SearchControl from "./search-controll";

export interface LocationValue {
    lat: number | null;
    long: number | null;
}

export default function LocationPicker({
    lat,
    long,
    radius = 5,
    onChange,
}: {
    lat: number | null;
    long: number | null;
    radius?: number;
    onChange: (pos: { lat: number; long: number }) => void;
}) {
    const [position, setPosition] = useState<[number, number] | null>(
        lat && long ? [lat, long] : null
    );

    // Sync position if props change (e.g. from search)
    useEffect(() => {
        if (lat && long) {
            setPosition([lat, long]);
        }
    }, [lat, long]);

    function MapClickHandler() {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                onChange({ lat, long: lng });
            },
        });
        return null;
    }

    return (
        <div className="rounded-lg border h-[400px] overflow-hidden">
            <MapContainer
                {...({
                    center: position || [-6.2, 106.8],
                    zoom: 17,
                    style: { height: "100%", width: "100%" }
                } as any)}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SearchControl
                    onSelect={(lat, lng) => {
                        setPosition([lat, lng]);
                        onChange({ lat, long: lng });
                    }}
                />
                <MapClickHandler />

                {position && (
                    <>
                        {/* We use CircleMarker for the exact center point (pick point) 
                            This guarantees it's ALWAYS in the middle of the radius circle */}
                        <CircleMarker 
                            {...({
                                center: position,
                                radius: 4,
                                pathOptions: {
                                    color: 'white',
                                    fillColor: '#ef4444',
                                    fillOpacity: 1,
                                    weight: 2
                                }
                            } as any)}
                        />
                        
                        {/* The Large pin for visibility, anchored correctly */}
                        <Marker {...({ position } as any)} />
                        
                        {/* The attendance area radius */}
                        <Circle
                            {...({
                                center: position,
                                radius: radius,
                                pathOptions: {
                                    color: '#2563eb',
                                    fillColor: '#3b82f6',
                                    fillOpacity: 0.3,
                                    weight: 2,
                                }
                            } as any)}
                        />
                    </>
                )}
            </MapContainer>
        </div>
    );
}
