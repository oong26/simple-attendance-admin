import { useEffect } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { useMap } from "react-leaflet";

export default function SearchControl({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
            provider,
            style: "bar",
            autoComplete: true,
            autoCompleteDelay: 250,
            showMarker: false,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
        });

        map.addControl(searchControl);

        /** Override placeholder AFTER the control is mounted */
        setTimeout(() => {
            const input = document.querySelector(".glass") as HTMLInputElement;
            if (input) {
                input.placeholder = "Masukkan alamat...";
            }
        }, 0);

        map.on("geosearch/showlocation", (result: any) => {
            const { x: lng, y: lat } = result.location;
            onSelect(lat, lng);
        });

        return () => map.removeControl(searchControl);
    }, [map]);

    return null;
}
