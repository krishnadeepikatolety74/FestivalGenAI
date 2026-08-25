/**
 * NEARBY FESTIVAL STORES — Leaflet + OpenStreetMap + Backend API
 *
 * No Google Maps API key required. Uses:
 * - Leaflet for interactive map rendering
 * - OpenStreetMap tiles (free)
 * - Backend /api/nearby-stores endpoint (Nominatim-powered)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Search, Store, Phone, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons (vite breaks the default paths)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Purple marker for festival stores
const festivalIcon = L.divIcon({
  className: "festival-marker",
  html: `<div style="
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #b969db 0%, #8b3fb8 100%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(185,105,219,0.5);
    display: flex; align-items: center; justify-content: center;
  "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// Active (selected) marker
const activeIcon = L.divIcon({
  className: "festival-marker-active",
  html: `<div style="
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #f1b049 0%, #e8942e 100%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 3px 12px rgba(241,176,73,0.6);
    display: flex; align-items: center; justify-content: center;
  "><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
});

interface StoreItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  address: string;
  distance_km: number;
  distance_text: string;
  phone: string;
  specialty: string;
  lat: number;
  lng: number;
  marker?: L.Marker;
}

interface MapViewProps {
  className?: string;
  location?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: L.Map) => void;
}

function getSavedFestivalName(): string {
  try {
    const raw = localStorage.getItem("festivalgen:plan");
    if (raw) {
      const plan = JSON.parse(raw);
      if (plan && plan.festival) return plan.festival;
    }
  } catch (e) {}
  try {
    const raw = localStorage.getItem("festivalgen:settings");
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.festival) return s.festival;
    }
  } catch (e) {}
  return "Diwali";
}

const categoriesOrder = ["All", "Puja", "Food", "Decorations", "Shopping", "Other"];

export function MapView({
  className,
  location,
  initialCenter = { lat: 17.385044, lng: 78.486671 },
  initialZoom = 13,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState(location || "Hyderabad");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mapError, setMapError] = useState<string | null>(null);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const storesRef = useRef<StoreItem[]>([]);
  const allStoresCache = useRef<{ city: string; stores: StoreItem[] } | null>(null);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = L.map(mapContainer.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstance.current = map;

    if (onMapReady) onMapReady(map);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const renderMarkers = useCallback((storeList: StoreItem[]) => {
    if (!mapInstance.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const updated = storeList.map((store) => {
      const marker = L.marker([store.lat, store.lng], {
        icon: festivalIcon,
      }).addTo(markersLayerRef.current!);

      const popupContent = `
        <div style="padding:8px;color:#4b2a5c;font-family:sans-serif;max-width:220px">
          <h4 style="margin:0 0 4px;font-size:13px;font-weight:600">${store.name}</h4>
          <p style="margin:0 0 4px;font-size:10px;color:#8c8294">${store.address}</p>
          <p style="margin:0;font-size:10px;color:#37bda9">📍 ${store.distance_text}</p>
        </div>`;
      marker.bindPopup(popupContent, { maxWidth: 240 });

      marker.on("click", () => {
        setActiveStoreId(store.id);
        storesRef.current.forEach((s) => {
          if (s.marker) s.marker.setIcon(s.id === store.id ? activeIcon : festivalIcon);
        });
      });

      store.marker = marker;
      return store;
    });

    storesRef.current = updated;
    setStores([...updated]);
    if (updated.length > 0 && mapInstance.current) {
      const bounds = L.latLngBounds(updated.map((store) => [store.lat, store.lng] as [number, number]));
      mapInstance.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 15, animate: true });
    }
  }, []);

  // Fetch stores from the backend API
  const fetchStores = useCallback(
    async (city: string, category: string) => {
      setLoading(true);
      setMapError(null);
      setStores([]);
      setActiveStoreId(null);
      markersLayerRef.current?.clearLayers();

      if (allStoresCache.current?.city === city) {
        const cachedStores = allStoresCache.current.stores.filter(
          (store) => category === "All" || store.category === category
        );
        if (cachedStores.length > 0) renderMarkers(cachedStores);
        else setMapError("No nearby festival stores found for this category.");
        setLoading(false);
        return;
      }

      const festival = getSavedFestivalName();

      try {
        const params = new URLSearchParams({
          city,
          category: "All",
          festival,
        });
        const res = await fetch(`/api/nearby-stores?${params.toString()}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.error) {
          console.error("Nearby stores API error:", data.error || `${res.status} ${res.statusText}`);
          setMapError(res.status === 502 || res.status >= 500 ? "Unable to load nearby stores. Please try again." : data.error || "Unable to load nearby stores. Please try again.");
          setLoading(false);
          return;
        }

        // Center the map on the city
        if (data.center && mapInstance.current) {
          mapInstance.current.setView([data.center.lat, data.center.lng], 13, {
            animate: true,
          });
        }

        const returnedStores = Array.isArray(data.stores)
          ? data.stores.filter((store: StoreItem) => category === "All" || store.category === category)
          : [];
        const allStores = Array.isArray(data.stores) ? data.stores : [];
        allStoresCache.current = { city, stores: allStores };

        if (returnedStores.length === 0) {
          setMapError("No nearby festival stores found for this category.");
          setLoading(false);
          return;
        }

        renderMarkers(returnedStores);
      } catch (err) {
        console.error("Failed to fetch nearby stores:", err);
        setMapError("Unable to load nearby stores. Please try again.");
      }

      setLoading(false);
    },
    [renderMarkers]
  );

  // Debounce city/category search
  const searchTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(() => {
      fetchStores(searchQuery, selectedCategory);
    }, 600);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, selectedCategory, fetchStores]);

  const handleStoreClick = (store: StoreItem) => {
    setActiveStoreId(store.id);
    if (mapInstance.current) {
      mapInstance.current.setView([store.lat, store.lng], 16, { animate: true });
    }
    // Update icons
    storesRef.current.forEach((s) => {
      if (s.marker) s.marker.setIcon(s.id === store.id ? activeIcon : festivalIcon);
    });
    // Open popup
    if (store.marker) {
      store.marker.openPopup();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 bg-white rounded-[15px] border border-[#ece6f2] shadow-sm min-h-[460px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[#f1eaf5] pb-3">
        <div>
          <h3 className="font-semibold text-base text-[#4b2a5c] flex items-center gap-2">
            <Store size={18} className="text-[#b969db]" /> Nearby Festival Stores
            in {searchQuery}
          </h3>
          <p className="text-xs text-[#8c8294]">
            {loading
              ? "Finding nearby festival stores..."
              : `Found ${stores.length} stores based on your location and festival needs`}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search size={14} className="absolute left-3 top-[10px] text-[#8c8294]" />
            <input
              type="text"
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-[160px] pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#ece6f2] bg-[#fdfcff] text-[#4b2a5c] focus:outline-none focus:border-[#b969db]"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categoriesOrder.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full border transition-all whitespace-nowrap",
              selectedCategory === cat
                ? "bg-[#b969db] text-white border-[#b969db]"
                : "bg-white text-[#4b2a5c] border-[#ece6f2] hover:bg-[#f6f4fb]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map + Store List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Map */}
        <div className="relative min-h-[280px] rounded-xl overflow-hidden border border-[#f0e5f3] bg-[#f5f2f7]">
          {mapError && !loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center p-6 text-center text-xs text-red-500 bg-red-50/80 backdrop-blur-sm rounded-xl">
              {mapError}
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full min-h-[280px]" />
        </div>

        {/* Store List */}
        <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-xs text-[#8c8294] py-12 gap-2">
              <Loader2 size={20} className="animate-spin text-[#b969db]" />
              Finding nearby festival stores...
            </div>
          ) : stores.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-[#8c8294] py-8">
              {mapError || "No nearby festival stores found for this category."}
            </div>
          ) : (
            stores.map((store) => (
              <button
                type="button"
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className={cn(
                  "text-left flex gap-3 p-3 border rounded-xl hover:shadow-sm transition-all group w-full",
                  activeStoreId === store.id
                    ? "border-[#b969db] bg-[#fdf8ff] shadow-sm"
                    : "border-[#f0e5f3] bg-[#fdfcff]"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f6e7f5] text-[#b969db] flex-shrink-0 group-hover:bg-[#b969db] group-hover:text-white transition-colors">
                  <Store size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <strong className="text-xs font-semibold text-[#4b2a5c] truncate block">
                      {store.name}
                    </strong>
                    <span className="text-[10px] font-bold text-[#37bda9] whitespace-nowrap bg-[#edfbf8] px-1.5 py-0.5 rounded-full">
                      {store.distance_text}
                    </span>
                  </div>
                  <div className="text-[9px] text-[#b969db] font-semibold mb-1">
                    {store.category}
                  </div>
                  <p className="text-[10px] text-[#8c8294] flex items-center gap-1 mb-1">
                    <MapPin size={11} /> {store.address}
                  </p>
                  {store.phone !== "—" && (
                    <p className="text-[10px] text-[#8c8294] flex items-center gap-1">
                      <Phone size={11} /> {store.phone}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
