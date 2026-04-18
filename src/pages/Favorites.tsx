import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Search } from 'lucide-react';
import ShopCard from '@/src/components/ShopCard';
import ShopDetails from '@/src/components/ShopDetails';
import { Shop, Review } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { shopService } from '@/src/services/shopService';
import { toast } from 'sonner';

export default function Favorites() {
  const { t } = useTranslation();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      const data = await shopService.getNearbyShops(0, 0);
      setShops(data);
      // Load favorites from local storage if needed, or use a default
      const storedFavs = localStorage.getItem('qareeb_favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      shopService.getShopReviews(selectedShop.id).then(setReviews);
    }
  }, [selectedShop]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('qareeb_favorites', JSON.stringify(newFavs));
    
    if (newFavs.includes(id)) {
      toast.success('Added to favorites');
    } else {
      toast.info('Removed from favorites');
    }
  };

  const favoriteShops = shops.filter(shop => favorites.includes(shop.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{t('favorites')}</h1>
        <p className="text-neutral-500">Your most loved shops in one place</p>
      </div>

      {favoriteShops.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteShops.map(shop => (
            <ShopCard 
              key={shop.id} 
              shop={shop} 
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              onClick={setSelectedShop}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-xl font-bold">No favorites yet</h2>
          <p className="mt-2 text-neutral-500">Start exploring and save shops you love!</p>
        </div>
      )}

      <ShopDetails 
        shop={selectedShop} 
        onClose={() => setSelectedShop(null)}
        isFavorite={selectedShop ? favorites.includes(selectedShop.id) : false}
        onToggleFavorite={toggleFavorite}
        reviews={reviews}
        onAddReview={async (text, rating) => {
          if (!selectedShop) return;
          const review = await shopService.addReview({
            shopId: selectedShop.id,
            comment: text,
            rating
          });
          setReviews(prev => [review, ...prev]);
        }}
      />
    </div>
  );
}
