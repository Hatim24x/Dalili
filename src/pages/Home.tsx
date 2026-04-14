import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import SearchBar from '@/src/components/SearchBar';
import CategoryFilter from '@/src/components/CategoryFilter';
import ShopList from '@/src/components/ShopList';
import MapComponent from '@/src/components/MapComponent';
import ShopDetails from '@/src/components/ShopDetails';
import ChatContainer from '@/src/components/ChatContainer';
import { Shop, UserProfile, Review } from '@/src/types';
import { mockShopService } from '@/src/services/shopService';
import { authService } from '@/src/services/authService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import ReviewList from '@/src/components/ReviewList';

// Remove MOCK_USER

export default function Home() {
  const { t } = useTranslation();
  const currentUser = authService.getCurrentUser();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [chatShop, setChatShop] = useState<Shop | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    const fetchShops = async () => {
      const data = await mockShopService.getNearbyShops(0, 0);
      setShops(data);
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      mockShopService.getShopReviews(selectedShop.id).then(setReviews);
    }
  }, [selectedShop]);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddReview = async () => {
    if (!selectedShop || !newReviewText.trim()) return;
    const review = await mockShopService.addReview({
      shopId: selectedShop.id,
      comment: newReviewText,
      rating: newReviewRating
    });
    setReviews(prev => [review, ...prev]);
    setNewReviewText('');
    toast.success('Review posted successfully!');
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
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
              <MapComponent 
                shops={filteredShops} 
                onShopClick={setSelectedShop}
              />
              
              <ShopList 
                shops={filteredShops}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onShopClick={setSelectedShop}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShopList 
                shops={filteredShops}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onShopClick={setSelectedShop}
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
