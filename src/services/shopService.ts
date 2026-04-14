import { Shop, Review } from '@/src/types';

const SHOPS_KEY = 'qareeb_shops';
const REVIEWS_KEY = 'qareeb_reviews';

const INITIAL_SHOPS: Shop[] = [
  {
    id: '1',
    ownerId: 'owner1',
    name: 'Bakery Delight',
    description: 'Freshly baked bread and pastries every morning. Our specialty is sourdough and croissants.',
    category: 'Food',
    isOpen: true,
    location: {
      lat: 24.7136,
      lng: 46.6753,
      address: 'King Fahd Rd, Riyadh'
    },
    rating: 4.8,
    reviewCount: 124,
    images: ['https://picsum.photos/seed/bakery/800/600'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    ownerId: 'owner2',
    name: 'Tech Haven',
    description: 'All your electronic needs in one place. From smartphones to high-end laptops.',
    category: 'Electronics',
    isOpen: false,
    location: {
      lat: 24.7236,
      lng: 46.6853,
      address: 'Olaya St, Riyadh'
    },
    rating: 4.5,
    reviewCount: 89,
    images: ['https://picsum.photos/seed/tech/800/600'],
    createdAt: new Date().toISOString()
  }
];

// Helper to limit image size/count to prevent localStorage overflow
const processImages = (images: string[]): string[] => {
  // Limit to 3 images and try to keep them small
  return images.slice(0, 3).map(img => {
    // If it's a very large base64, we might want to warn, but for now just pass it
    return img;
  });
};

export const mockShopService = {
  getShops: (): Shop[] => {
    try {
      const stored = localStorage.getItem(SHOPS_KEY);
      if (!stored) {
        localStorage.setItem(SHOPS_KEY, JSON.stringify(INITIAL_SHOPS));
        return INITIAL_SHOPS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading shops from localStorage', e);
      return INITIAL_SHOPS;
    }
  },

  getNearbyShops: async (lat: number, lng: number): Promise<Shop[]> => {
    const shops = mockShopService.getShops();
    return shops;
  },

  addShop: async (shopData: Partial<Shop>, ownerId: string): Promise<Shop> => {
    const shops = mockShopService.getShops();
    const processedImages = processImages(shopData.images || []);
    
    const newShop: Shop = {
      id: Math.random().toString(36).substr(2, 9),
      ownerId: ownerId,
      name: shopData.name || '',
      description: shopData.description || '',
      category: shopData.category || '',
      isOpen: true,
      location: shopData.location || { lat: 24.7136, lng: 46.6753, address: '' },
      rating: 0,
      reviewCount: 0,
      images: processedImages.length > 0 ? processedImages : [`https://picsum.photos/seed/${Math.random()}/800/600`],
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...shops, newShop];
    try {
      localStorage.setItem(SHOPS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage full, could not add shop', e);
      throw new Error('Storage limit reached. Try using fewer or smaller images.');
    }
    return newShop;
  },

  updateShop: async (shopId: string, shopData: Partial<Shop>): Promise<Shop> => {
    const shops = mockShopService.getShops();
    const shopIndex = shops.findIndex(s => s.id === shopId);
    if (shopIndex === -1) throw new Error('Shop not found');

    const processedData = { ...shopData };
    if (shopData.images) {
      processedData.images = processImages(shopData.images);
    }

    const updatedShop = { ...shops[shopIndex], ...processedData };
    shops[shopIndex] = updatedShop;
    
    try {
      localStorage.setItem(SHOPS_KEY, JSON.stringify(shops));
    } catch (e) {
      console.error('LocalStorage full, could not update shop', e);
      throw new Error('Storage limit reached. Try using fewer or smaller images.');
    }
    return updatedShop;
  },

  getShopReviews: async (shopId: string): Promise<Review[]> => {
    const stored = localStorage.getItem(REVIEWS_KEY);
    const reviews: Review[] = stored ? JSON.parse(stored) : [];
    return reviews.filter(r => r.shopId === shopId);
  },

  addReview: async (reviewData: Partial<Review>): Promise<Review> => {
    const stored = localStorage.getItem(REVIEWS_KEY);
    const reviews: Review[] = stored ? JSON.parse(stored) : [];
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      shopId: reviewData.shopId || '',
      userId: 'user1',
      userName: 'John Doe',
      rating: reviewData.rating || 5,
      comment: reviewData.comment || '',
      createdAt: new Date().toISOString(),
    };
    const updated = [...reviews, newReview];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    return newReview;
  },

  toggleShopStatus: async (shopId: string, isOpen: boolean): Promise<void> => {
    const shops = mockShopService.getShops();
    const updated = shops.map(s => s.id === shopId ? { ...s, isOpen } : s);
    localStorage.setItem(SHOPS_KEY, JSON.stringify(updated));
  }
};
