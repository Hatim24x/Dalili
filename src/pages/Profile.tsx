import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Bell, LogOut, ChevronRight, Store, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { chatService } from '@/src/services/chatService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { UserProfile } from '@/src/types';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    email: ''
  });
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  // Notification Listener
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = chatService.onChatsChange(currentUser.uid, (chats) => {
      const totalMessagesSum = chats.reduce((acc, chat) => acc + (chat.lastMessage ? 1 : 0), 0);
      
      if (lastMessageCount > 0 && totalMessagesSum > lastMessageCount) {
        toast.info('You have a new message!', {
          action: {
            label: 'View',
            onClick: () => navigate('/chat')
          }
        });
      }
      setLastMessageCount(totalMessagesSum);
    });

    return () => unsubscribe();
  }, [currentUser, lastMessageCount, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Profile updates are managed via your Google account');
    setIsEditing(false);
  };

  const isAdmin = currentUser?.email === 'hatim14995@gmail.com';

  const menuItems = [
    { 
      icon: User, 
      label: 'Edit Profile', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      onClick: () => setIsEditing(true)
    },
    ...(currentUser?.role === 'owner' ? [{ icon: Store, label: 'Manage My Shop', color: 'text-primary-600', bg: 'bg-primary-50', path: '/owner' }] : []),
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Control Panel', color: 'text-red-600', bg: 'bg-red-50', path: '/admin' }] : []),
    { icon: Bell, label: 'Notifications', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Shield, label: 'Security', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold">Please login to view profile</h2>
        <button 
          onClick={() => navigate('/login')}
          className="mt-4 rounded-xl bg-primary-600 px-6 py-2 text-white font-bold"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="" className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User className="h-16 w-16" />
            </div>
          )}
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-900">{currentUser.displayName}</h1>
        <p className="text-neutral-500">{currentUser.email}</p>
        <div className="mt-4 rounded-full bg-primary-50 px-4 py-1 text-xs font-bold text-primary-600 uppercase tracking-wider">
          {currentUser.role === 'owner' ? t('owner_role') : t('user_role')}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border border-primary-100 bg-primary-50/30 p-6"
          >
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">Update Information</h3>
                <button type="button" onClick={() => setIsEditing(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Display Name</label>
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Email Address</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-bold text-white transition-colors hover:bg-primary-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {menuItems.map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            onClick={() => {
              if (item.onClick) item.onClick();
              else if (item.path) navigate(item.path);
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-all hover:border-neutral-200"
          >
            <div className="flex items-center gap-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", item.bg)}>
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>
              <span className="font-bold text-neutral-700">{item.label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </motion.button>
        ))}

        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600 transition-all hover:bg-red-100"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-bold">{t('logout')}</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
