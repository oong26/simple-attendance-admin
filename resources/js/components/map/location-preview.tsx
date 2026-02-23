import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "/assets/icons/marker-icon.svg",
    iconRetinaUrl: "/assets/icons/marker-icon-2x.svg",
    shadowUrl: null,
});

export default function LocationPreview({
    lat,
    long,
}: {
    lat: number | null;
    long: number | null;
}) {
    if (!lat || !long) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground">
                Lokasi belum ditentukan.
            </div>
        );
    }

    const position: [number, number] = [lat, long];

    return (
        <div className="rounded-lg border h-[400px] overflow-hidden">
            <MapContainer
                {...({
                    center: position,
                    zoom: 14,
                    style: { height: "100%", width: "100%" }
                } as any)}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} />
            </MapContainer>
        </div>
    );
}
