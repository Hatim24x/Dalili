import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { Shop, Review } from '@/src/types';

const SHOPS_COLLECTION = 'shops';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const shopService = {
  getShops: async (): Promise<Shop[]> => {
    try {
      const q = query(collection(db, SHOPS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, SHOPS_COLLECTION);
      return [];
    }
  },

  getNearbyShops: async (lat: number, lng: number): Promise<Shop[]> => {
    return shopService.getShops();
  },

  addShop: async (shopData: Partial<Shop>, ownerId: string): Promise<Shop> => {
    try {
      const newShop = {
        ...shopData,
        ownerId,
        isOpen: true,
        rating: 0,
        reviewCount: 0,
        viewsCount: 0,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, SHOPS_COLLECTION), newShop);
      return { id: docRef.id, ...newShop } as unknown as Shop;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, SHOPS_COLLECTION);
      throw error;
    }
  },

  updateShop: async (shopId: string, shopData: Partial<Shop>): Promise<void> => {
    try {
      const shopRef = doc(db, SHOPS_COLLECTION, shopId);
      await updateDoc(shopRef, shopData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SHOPS_COLLECTION}/${shopId}`);
    }
  },

  deleteShop: async (shopId: string): Promise<void> => {
    try {
      const shopRef = doc(db, SHOPS_COLLECTION, shopId);
      await deleteDoc(shopRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${SHOPS_COLLECTION}/${shopId}`);
    }
  },

  getShopReviews: async (shopId: string): Promise<Review[]> => {
    try {
      const reviewsRef = collection(db, SHOPS_COLLECTION, shopId, 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${SHOPS_COLLECTION}/${shopId}/reviews`);
      return [];
    }
  },

  addReview: async (reviewData: Partial<Review>): Promise<Review> => {
    if (!reviewData.shopId) throw new Error('Shop ID is required');
    try {
      const reviewsRef = collection(db, SHOPS_COLLECTION, reviewData.shopId, 'reviews');
      const newReview = {
        ...reviewData,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(reviewsRef, newReview);
      
      // Update shop rating (simplified)
      const shopRef = doc(db, SHOPS_COLLECTION, reviewData.shopId);
      await updateDoc(shopRef, {
        reviewCount: increment(1)
      });

      return { id: docRef.id, ...newReview } as unknown as Review;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${SHOPS_COLLECTION}/${reviewData.shopId}/reviews`);
      throw error;
    }
  },

  incrementViews: async (shopId: string): Promise<void> => {
    try {
      const shopRef = doc(db, SHOPS_COLLECTION, shopId);
      await updateDoc(shopRef, {
        viewsCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SHOPS_COLLECTION}/${shopId}`);
    }
  }
};
