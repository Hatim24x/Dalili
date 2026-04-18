import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List as ListIcon, MapPin } from 'lucide-react';
import SearchBar from '@/src/components/SearchBar';
import CategoryFilter from '@/src/components/CategoryFilter';
import ShopList from '@/src/components/ShopList';
import MapComponent from '@/src/components/MapComponent';
import ShopDetails from '@/src/components/ShopDetails';
import ChatContainer from '@/src/components/ChatContainer';
import { Shop, UserProfile, Review } from '@/src/types';
import { shopService } from '@/src/services/shopService';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import ReviewList from '@/src/components/ReviewList';

import { useGeolocation } from '@/src/hooks/useGeolocation';
import { calculateDistance } from '@/src/lib/utils';

export default function Home() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { location: userLocation, requestLocation } = useGeolocation();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [chatShop, setChatShop] = useState<Shop | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('qareeb_favorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('qareeb_favorites', JSON.stringify(favorites));
  }, [favorites]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.8491, 47.1456]);

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const data = await shopService.getNearbyShops(0, 0);
        setShops(data);
      } catch (error) {
        toast.error('Failed to load shops');
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedShop) {
      shopService.getShopReviews(selectedShop.id).then(setReviews);
    }
  }, [selectedShop]);

  const sortedShops = React.useMemo(() => {
    const filtered = shops.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shop.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (viewMode === 'map' && userLocation) {
      return [...filtered].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        return distA - distB;
      });
    }

    return filtered;
  }, [shops, searchQuery, selectedCategory, userLocation, viewMode]);

  const handleAddReview = async () => {
    if (!selectedShop || !newReviewText.trim() || !currentUser) return;
    try {
      const review = await shopService.addReview({
        shopId: selectedShop.id,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        comment: newReviewText,
        rating: newReviewRating
      });
      setReviews(prev => [review, ...prev]);
      setNewReviewText('');
      toast.success('Review posted successfully!');
    } catch (error) {
      toast.error('Failed to post review');
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      if (newFavs.includes(id)) {
        toast.success('Added to favorites');
      } else {
        toast.info('Removed from favorites');
      }
      return newFavs;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-2xl">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
              onFilterClick={() => {}} 
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('near_me')}</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                <ListIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('details')}</span>
              </button>
            </div>
          </div>
        </div>

        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onSelect={setSelectedCategory} 
        />
      </div>

      {/* Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="relative">
                <MapComponent 
                  shops={sortedShops} 
                  onShopClick={(shop) => {
                    setSelectedShop(shop);
                    shopService.incrementViews(shop.id);
                  }}
                  center={mapCenter}
                  userLocation={userLocation}
                />
                {userLocation && (
                  <button 
                    onClick={() => setMapCenter([userLocation.lat, userLocation.lng])}
                    className="absolute bottom-6 right-6 z-[1000] flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl text-primary-600 hover:bg-neutral-50"
                    title="Center on my location"
                  >
                    <MapPin className="h-6 w-6" />
                  </button>
                )}
              </div>
              
              <div className="mt-8">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                  </div>
                ) : (
                  <ShopList 
                    shops={sortedShops}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onShopClick={(shop) => {
                      setSelectedShop(shop);
                      shopService.incrementViews(shop.id);
                    }}
                    userLocation={userLocation}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShopList 
                shops={sortedShops}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onShopClick={(shop) => {
                  setSelectedShop(shop);
                  shopService.incrementViews(shop.id);
                }}
                userLocation={userLocation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shop Details Modal */}
      <ShopDetails 
        shop={selectedShop} 
        onClose={() => setSelectedShop(null)}
        isFavorite={selectedShop ? favorites.includes(selectedShop.id) : false}
        onToggleFavorite={toggleFavorite}
        onChatClick={(shop, chatId) => {
          setSelectedShop(null);
          setChatShop(shop);
          setActiveChatId(chatId);
        }}
        reviews={reviews}
        onAddReview={(text, rating) => {
          setNewReviewText(text);
          setNewReviewRating(rating);
          handleAddReview();
        }}
      />

      {/* Chat Window */}
      <ChatContainer 
        shop={chatShop}
        chatId={activeChatId}
        currentUser={currentUser}
        onClose={() => {
          setChatShop(null);
          setActiveChatId(null);
        }}
      />
    </div>
  );
}
