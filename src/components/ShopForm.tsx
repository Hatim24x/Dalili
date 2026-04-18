import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shop } from '@/src/types';
import { Camera, MapPin, Save, X } from 'lucide-react';
import LocationPicker from './LocationPicker';
import { CATEGORIES } from '@/src/constants';

interface ShopFormProps {
  initialData?: Partial<Shop>;
  onSubmit: (data: Partial<Shop>) => void;
  onCancel: () => void;
}

export default function ShopForm({ initialData, onSubmit, onCancel }: ShopFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    address: initialData?.location?.address || '',
    lat: initialData?.location?.lat || 31.8491,
    lng: initialData?.location?.lng || 47.1456,
    images: initialData?.images || [],
    openTime: initialData?.businessHours?.open || '08:00',
    closeTime: initialData?.businessHours?.close || '22:00',
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address.length >= 3) {
        performSearch(formData.address);
      } else {
        setSuggestions([]);
      }
    }, 800); // 800ms debounce to respect Nominatim's 1 req/sec policy

    return () => clearTimeout(timer);
  }, [formData.address]);

  const performSearch = async (query: string) => {
    // Don't search if the query matches a selected suggestion exactly
    if (suggestions.some(s => s.display_name === query)) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'ar,en', // Prefer Arabic then English
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSearchError('Could not fetch address suggestions. Please try again or enter manually.');
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressChange = (query: string) => {
    setFormData({ ...formData, address: query });
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    // Clear suggestions immediately to avoid re-triggering search
    setSuggestions([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      location: {
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
      },
      businessHours: {
        open: formData.openTime,
        close: formData.closeTime
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-neutral-700">{t('shop_name')}</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700">{t('shop_description')}</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-neutral-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700">{t('location')}</label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Search address..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 pl-10 text-sm focus:border-primary-500 focus:outline-none"
              />
              
              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 border-b border-neutral-50 last:border-0"
                    >
                      <p className="font-medium text-neutral-900 line-clamp-1">{suggestion.display_name}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchError && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 shadow-sm">
                  {searchError}
                </div>
              )}
              
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-neutral-700">Opening Time</label>
            <input
              type="time"
              value={formData.openTime}
              onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700">Closing Time</label>
            <input
              type="time"
              value={formData.closeTime}
              onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">Select Location on Map</label>
          <LocationPicker 
            onLocationSelect={(lat, lng) => setFormData({ ...formData, lat, lng })}
            initialLocation={{ lat: formData.lat, lng: formData.lng }}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700">Photos</label>
          <div className="mt-2 flex flex-wrap gap-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-neutral-200">
                <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-colors hover:border-primary-500 hover:text-primary-600">
              <Camera className="h-6 w-6" />
              <span className="text-[10px] font-bold">Add Photo</span>
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
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 font-bold text-white transition-colors hover:bg-primary-700"
        >
          <Save className="h-5 w-5" />
          {t('save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 py-4 font-bold text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          <X className="h-5 w-5" />
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
