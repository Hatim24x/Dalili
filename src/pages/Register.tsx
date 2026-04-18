import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Store, ArrowRight, MapPin, FileText, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { UserRole } from '@/src/types';
import { shopService } from '@/src/services/shopService';
import { authService } from '@/src/services/authService';
import { toast } from 'sonner';
import LocationPicker from '@/src/components/LocationPicker';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Shop fields
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopLocation, setShopLocation] = useState<{ lat: number, lng: number }>({ lat: 31.8491, lng: 47.1456 });
  const [shopImages, setShopImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await authService.loginWithGoogle(role);
      
      if (role === 'owner') {
        try {
          await shopService.addShop({
            name: shopName,
            description: shopDescription,
            location: { ...shopLocation, address: shopAddress },
            category: 'General',
            images: shopImages
          }, user.uid);
          toast.success('Shop registered successfully!');
          navigate('/owner');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to register shop';
          toast.error(message);
        }
      } else {
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Registration cancelled. Please keep the window open to sign in.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Registration popup was blocked. Please allow popups for this site.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">{t('register')}</h1>
          <p className="mt-2 text-neutral-500">Join Qareeb today</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
            We'll use your Google account to create your profile. Please choose your role below:
          </div>
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                role === 'user' 
                  ? "border-primary-600 bg-primary-50 text-primary-600" 
                  : "border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-neutral-200"
              )}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-bold">{t('user_role')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                role === 'owner' 
                  ? "border-primary-600 bg-primary-50 text-primary-600" 
                  : "border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-neutral-200"
              )}
            >
              <Store className="h-6 w-6" />
              <span className="text-sm font-bold">{t('owner_role')}</span>
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {role === 'owner' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-neutral-100"
                >
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Shop Name"
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 h-5 w-5 text-neutral-400" />
                    <textarea
                      required
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      placeholder="Shop Description"
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="Shop Address Description (e.g. Near King Fahd Gate)"
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Select Location on Map
                    </label>
                    <LocationPicker 
                      onLocationSelect={(lat, lng) => setShopLocation({ lat, lng })}
                      initialLocation={shopLocation}
                    />
                    <p className="text-[10px] text-neutral-400 italic">
                      Click on the map to set your shop's precise location
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Shop Photos
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {shopImages.map((img, idx) => (
                        <div key={idx} className="h-16 w-16 overflow-hidden rounded-xl border border-neutral-200">
                          <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                      <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-primary-500 hover:text-primary-600 transition-colors">
                        <Camera className="h-5 w-5" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 font-bold text-white transition-colors hover:bg-primary-700"
          >
            {t('register')}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            {t('login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
