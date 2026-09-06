"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Listing } from "@/generated/prisma/client";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type MapListing = Pick<Listing, "id" | "slug" | "title" | "latitude" | "longitude" | "locationLabel" | "type">;

interface ListingMapProps {
  listings: MapListing[];
  center: [number, number];
  zoom?: number;
  onSelect?: (slug: string) => void;
}

export function ListingMap({ listings, center, zoom = 12, onSelect }: ListingMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="h-full min-h-[400px] rounded-2xl bg-cream-dark animate-pulse flex items-center justify-center text-ink-muted text-sm">
        Loading map...
      </div>
    );
  }

  return (
    <div className="h-full min-h-[400px] rounded-2xl overflow-hidden border border-stone/60 shadow-sm">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => (
          <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{listing.title}</p>
                <p className="text-gray-600 mt-1">{listing.locationLabel}</p>
                <button
                  onClick={() => onSelect?.(listing.slug)}
                  className="mt-2 text-terracotta hover:underline font-medium"
                >
                  View listing →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}