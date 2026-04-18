import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, LogOut, User, Map as MapIcon, Heart, MessageSquare, Store } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { authService } from '@/src/services/authService';
import { useAuth } from '@/src/context/AuthContext';
import { UserProfile } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, logout } = useAuth();

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
                <MapIcon className="h-6 w-6" />
                <span>{t('app_name')}</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link 
                  to="/" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600",
                    location.pathname === '/' ? "text-primary-600" : "text-neutral-500"
                  )}
                >
                  {t('near_me')}
                </Link>
                <Link 
                  to="/favorites" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600",
                    location.pathname === '/favorites' ? "text-primary-600" : "text-neutral-500"
                  )}
                >
                  {t('favorites')}
                </Link>
                <Link 
                  to="/chat" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600",
                    location.pathname === '/chat' ? "text-primary-600" : "text-neutral-500"
                  )}
                >
                  {t('chat')}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-50"
              >
                <Globe className="h-4 w-4" />
                <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              <div className="h-6 w-px bg-neutral-200" />

              {currentUser ? (
                <div className="flex items-center gap-4">
                  {currentUser.role === 'owner' && (
                    <Link to="/owner" className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-primary-600">
                      {t('owner_role')}
                    </Link>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-neutral-900">{currentUser.displayName}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-primary-600">
                    {t('login')}
                  </Link>
                  <Link 
                    to="/register" 
                    className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white md:hidden">
        <div className="flex items-center justify-around p-4">
          <Link to="/" className="flex flex-col items-center gap-1 text-neutral-500 hover:text-primary-600">
            <MapIcon className="h-6 w-6" />
            <span className="text-[10px]">{t('near_me')}</span>
          </Link>
          <Link to="/favorites" className="flex flex-col items-center gap-1 text-neutral-500 hover:text-primary-600">
            <Heart className="h-6 w-6" />
            <span className="text-[10px]">{t('favorites')}</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center gap-1 text-neutral-500 hover:text-primary-600">
            <MessageSquare className="h-6 w-6" />
            <span className="text-[10px]">{t('chat')}</span>
          </Link>
          {currentUser?.role === 'owner' && (
            <Link to="/owner" className="flex flex-col items-center gap-1 text-neutral-500 hover:text-primary-600">
              <Store className="h-6 w-6" />
              <span className="text-[10px]">{t('owner_role')}</span>
            </Link>
          )}
          <Link to="/profile" className="flex flex-col items-center gap-1 text-neutral-500 hover:text-primary-600">
            <User className="h-6 w-6" />
            <span className="text-[10px]">{t('user_role')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
