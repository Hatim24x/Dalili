import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Clock, Settings, MessageSquare, BarChart3, Power, Star, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Shop, Review } from '@/src/types';
import { shopService } from '@/src/services/shopService';
import { chatService } from '@/src/services/chatService';
import { authService } from '@/src/services/authService';
import ShopForm from '@/src/components/ShopForm';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        const shops = await shopService.getNearbyShops(0, 0);
        const myShop = shops.find(s => s.ownerId === currentUser.uid);
        setShop(myShop || null);
        if (myShop) {
          const shopReviews = await shopService.getShopReviews(myShop.id);
          setReviews(shopReviews);
          
          const chatData = await chatService.getChats(currentUser.uid);
          setChatCount(chatData.length);
        }
      } catch (error) {
        console.error('Error fetching shop:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchShop();
    }
  }, [currentUser?.uid, authLoading]);

  const toggleStatus = async () => {
    if (!shop) return;
    const newStatus = !shop.isOpen;
    await shopService.updateShop(shop.id, { isOpen: newStatus });
    setShop(prev => prev ? { ...prev, isOpen: newStatus } : null);
    toast.success(newStatus ? 'Shop is now Open' : 'Shop is now Closed');
  };

  const handleUpdateShop = async (data: Partial<Shop>) => {
    if (!shop) return;
    try {
      await shopService.updateShop(shop.id, data);
      setShop(prev => prev ? { ...prev, ...data } : null);
      setIsEditing(false);
      toast.success('Shop updated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update shop';
      toast.error(message);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!shop) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Store className="h-16 w-16 text-neutral-200" />
      <h2 className="mt-4 text-xl font-bold">No shop found</h2>
      <p className="text-neutral-500">You haven't registered a shop yet.</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('owner_role')}</h1>
          <p className="text-neutral-500">Manage your shop and interact with customers</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-4 font-bold text-neutral-700 transition-all hover:bg-neutral-50"
          >
            <Edit3 className="h-5 w-5" />
            <span>Edit Shop</span>
          </button>
          <button
            onClick={toggleStatus}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-6 py-4 font-bold text-white transition-all shadow-lg",
              shop.isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            )}
          >
            <Power className="h-5 w-5" />
            <span>{shop.isOpen ? t('open') : t('closed')}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="mb-6 text-2xl font-bold">Edit Shop Details</h2>
              <ShopForm 
                initialData={shop}
                onSubmit={handleUpdateShop}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Stats */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Views</p>
              <p className="text-2xl font-bold">{shop.viewsCount || 0}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50/30 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Conversations</p>
              <p className="text-2xl font-bold">{chatCount}</p>
            </div>
          </div>
        </button>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Active Hours</p>
              <p className="text-2xl font-bold">
                {shop.businessHours?.open || '08:00'} - {shop.businessHours?.close || '22:00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Shop Info */}
        <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('details')}</h2>
            <button className="text-sm font-bold text-primary-600 hover:underline">Edit</button>
          </div>
          
          <div className="aspect-video overflow-hidden rounded-2xl">
            <img 
              src={shop.images[0]} 
              alt={shop.name} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('shop_name')}</label>
              <p className="text-lg font-medium">{shop.name}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('shop_description')}</label>
              <p className="text-neutral-600">{shop.description}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('location')}</label>
              <p className="text-neutral-600">{shop.location.address}</p>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">{t('reviews')}</h2>
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="rounded-2xl border border-neutral-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-neutral-200" />
                    <span className="font-bold">{review.userName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-bold text-neutral-900">{review.rating}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>
              </div>
            )) : (
              <p className="text-neutral-500 italic">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
