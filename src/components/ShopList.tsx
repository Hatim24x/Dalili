import React from 'react';
import { Shop } from '@/src/types';
import ShopCard from './ShopCard';
import { useTranslation } from 'react-i18next';

interface ShopListProps {
  shops: Shop[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onShopClick: (shop: Shop) => void;
}

export default function ShopList({ shops, favorites, onToggleFavorite, onShopClick }: ShopListProps) {
  const { t } = useTranslation();

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-neutral-500">{t('no_shops_found')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          isFavorite={favorites.includes(shop.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onShopClick}
        />
      ))}
    </div>
  );
}
