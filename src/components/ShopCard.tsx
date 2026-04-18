import React from 'react';
import { Shop } from '@/src/types';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Heart, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, calculateDistance, formatDistance } from '@/src/lib/utils';

interface ShopCardProps {
  key?: string | number;
  shop: Shop;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onClick?: (shop: Shop) => void;
  userLocation?: { lat: number, lng: number } | null;
}

export default function ShopCard({ shop, isFavorite, onToggleFavorite, onClick, userLocation }: ShopCardProps) {
  const { t } = useTranslation();

  const distanceText = React.useMemo(() => {
    if (!userLocation) return null;
    const dist = calculateDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng);
    return formatDistance(dist);
  }, [userLocation, shop.location]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
      onClick={() => onClick?.(shop)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={shop.images[0] || `https://picsum.photos/seed/${shop.id}/600/400`}
          alt={shop.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(shop.id);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors",
              isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-neutral-600 hover:bg-white hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold shadow-sm",
            shop.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
          )}>
            {shop.isOpen ? t('open') : t('closed')}
          </span>
        </div>
      </div>

      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-neutral-900 truncate">{shop.name}</h3>
            <p className="mt-0.5 text-xs md:text-sm text-neutral-500 line-clamp-1">{shop.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-xs md:text-sm font-bold text-primary-700">
            <Star className="h-3.5 w-3.5 md:h-4 w-4 fill-current" />
            <span>{shop.rating}</span>
          </div>
        </div>

        <div className="mt-3 md:mt-4 flex items-center justify-between gap-4 text-[11px] md:text-sm text-neutral-500">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 md:h-4 w-4 shrink-0" />
            <span className="truncate">{shop.location.address}</span>
          </div>
          {distanceText && (
            <span className="shrink-0 font-medium text-primary-600">{distanceText}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
