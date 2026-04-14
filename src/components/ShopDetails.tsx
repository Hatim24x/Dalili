import React from 'react';
import { Shop, Review } from '@/src/types';
import { useTranslation } from 'react-i18next';
import { X, Star, MapPin, Clock, MessageSquare, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { mockChatService } from '@/src/services/chatService';
import { authService } from '@/src/services/authService';
import { toast } from 'sonner';

interface ShopDetailsProps {
  shop: Shop | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onChatClick?: (shop: Shop, chatId: string) => void;
  reviews: Review[];
  onAddReview: (text: string, rating: number) => void;
}

export default function ShopDetails({ 
  shop, 
  onClose, 
  isFavorite, 
  onToggleFavorite, 
  onChatClick,
  reviews,
  onAddReview
}: ShopDetailsProps) {
  const { t } = useTranslation();
  const [reviewText, setReviewText] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [activeImage, setActiveImage] = React.useState(0);

  if (!shop) return null;

  const handleChatClick = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      toast.error('Please login to chat with shop owners');
      return;
    }
    
    try {
      const chat = await mockChatService.createChat(user.uid, shop.ownerId, shop.id);
      onChatClick?.(shop, chat.id);
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const images = shop.images.length > 0 ? shop.images : [`https://picsum.photos/seed/${shop.id}/800/600`];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-900 backdrop-blur-md transition-colors hover:bg-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative group">
            <div className="h-64 sm:h-80 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={images[activeImage]}
                  alt={shop.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>
            
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 rounded-full bg-black/20 p-2 backdrop-blur-md">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      activeImage === idx ? "w-4 bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="max-h-[80vh] overflow-y-auto p-6 sm:p-8">
            {images.length > 1 && (
              <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      activeImage === idx ? "border-primary-600 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-neutral-900">{shop.name}</h2>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    shop.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {shop.isOpen ? t('open') : t('closed')}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-neutral-900">{shop.rating}</span>
                    <span>({shop.reviewCount} {t('reviews')})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{shop.location.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onToggleFavorite?.(shop.id)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors",
                    isFavorite ? "border-red-500 bg-red-50 text-red-500" : "border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 transition-colors hover:bg-neutral-50">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold">{t('details')}</h3>
              <p className="mt-2 text-neutral-600 leading-relaxed">
                {shop.description}
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleChatClick}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 font-bold text-white transition-colors hover:bg-primary-700"
              >
                <MessageSquare className="h-5 w-5" />
                {t('chat')}
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${shop.location.lat},${shop.location.lng}`, '_blank')}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-primary-600 py-4 font-bold text-primary-600 transition-colors hover:bg-primary-50"
              >
                <MapPin className="h-5 w-5" />
                {t('location')}
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 space-y-8">
              <div className="border-t border-neutral-100 pt-8">
                <h3 className="text-xl font-bold">{t('reviews')}</h3>
                
                {/* Add Review Form */}
                <div className="mt-6 space-y-4 rounded-2xl bg-neutral-50 p-6">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={cn(
                          "transition-transform hover:scale-110",
                          s <= rating ? "text-yellow-400" : "text-neutral-300"
                        )}
                      >
                        <Star className={cn("h-6 w-6", s <= rating && "fill-current")} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      onAddReview(reviewText, rating);
                      setReviewText('');
                    }}
                    disabled={!reviewText.trim()}
                    className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    Post Review
                  </button>
                </div>

                {/* Reviews List */}
                <div className="mt-8 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-neutral-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-neutral-200" />
                          <span className="font-bold text-sm">{review.userName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-bold text-neutral-900">{review.rating}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
