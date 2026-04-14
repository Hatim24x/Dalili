import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Shop } from '@/src/types';
import { useTranslation } from 'react-i18next';
import { Star, Clock, MapPin } from 'lucide-react';

// Custom icons for Open and Closed shops
const createShopIcon = (isOpen: boolean) => {
  const color = isOpen ? '#16a34a' : '#dc2626'; // green-600 and red-600
  return L.divIcon({
    className: 'custom-shop-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

interface MapComponentProps {
  shops: Shop[];
  center?: [number, number];
  onShopClick?: (shop: Shop) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapComponent({ shops, center = [24.7136, 46.6753], onShopClick }: MapComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        
        {shops.map((shop) => (
          <Marker 
            key={shop.id} 
            position={[shop.location.lat, shop.location.lng]}
            icon={createShopIcon(shop.isOpen)}
            eventHandlers={{
              click: () => onShopClick?.(shop),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <img 
                  src={shop.images[0] || 'https://picsum.photos/seed/shop/400/200'} 
                  alt={shop.name}
                  className="mb-2 h-24 w-full rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-lg font-bold">{shop.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{shop.rating}</span>
                  <span>({shop.reviewCount})</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {shop.isOpen ? t('open') : t('closed')}
                  </span>
                  <button 
                    onClick={() => onShopClick?.(shop)}
                    className="text-xs font-semibold text-primary-600 hover:underline"
                  >
                    {t('details')}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
