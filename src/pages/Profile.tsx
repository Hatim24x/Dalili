import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Bell, LogOut, ChevronRight, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { authService } from '@/src/services/authService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const menuItems = [
    { icon: User, label: 'Edit Profile', color: 'text-blue-600', bg: 'bg-blue-50' },
    ...(currentUser?.role === 'owner' ? [{ icon: Store, label: 'Manage My Shop', color: 'text-primary-600', bg: 'bg-primary-50', path: '/owner' }] : []),
    { icon: Bell, label: 'Notifications', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Shield, label: 'Security', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const handleLogout = () => {
    authService.logout();
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
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-16 w-16" />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-900">{currentUser.displayName}</h1>
        <p className="text-neutral-500">{currentUser.email}</p>
        <div className="mt-4 rounded-full bg-primary-50 px-4 py-1 text-xs font-bold text-primary-600 uppercase tracking-wider">
          {currentUser.role === 'owner' ? t('owner_role') : t('user_role')}
        </div>
      </div>

      <div className="space-y-4">
        {menuItems.map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            onClick={() => item.path && navigate(item.path)}
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
