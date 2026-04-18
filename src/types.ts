export type UserRole = 'user' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  favorites?: string[]; // Array of shop IDs
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  isOpen: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  createdAt: string;
  viewsCount?: number;
  businessHours?: {
    open: string;
    close: string;
  };
}

export interface Review {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[]; // [userId, ownerId]
  shopId: string;
  initiatorName?: string;
  lastMessage?: string;
  updatedAt: string;
}
