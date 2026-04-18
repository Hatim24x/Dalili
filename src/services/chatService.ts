import { Message, Chat } from '@/src/types';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  onSnapshot, 
  orderBy, 
  limit,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { toast } from 'sonner';

export const chatService = {
  getChats: async (userId: string): Promise<Chat[]> => {
    try {
      const chatsRef = collection(db, 'chats');
      // Simplify query to avoid composite index requirements
      const q = query(chatsRef, where('participants', 'array-contains', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
          } as Chat;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error("Error getting chats:", error);
      return [];
    }
  },
  
  onChatsChange: (userId: string, callback: (chats: Chat[]) => void) => {
    const chatsRef = collection(db, 'chats');
    // Simplify query to avoid composite index requirements
    const q = query(chatsRef, where('participants', 'array-contains', userId));
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
          } as Chat;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(chats);
    }, (error) => {
      console.error("Error listening to chats:", error);
      toast.error("Failed to sync chats. Please check your connection.");
    });
  },

  onMessagesChange: (chatId: string, callback: (messages: Message[]) => void) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    // Default order by createdAt is usually safe, but let's be careful
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        } as Message;
      });
      callback(messages);
    }, (error) => {
      console.error("Error listening to messages:", error);
      toast.error("Failed to sync messages.");
    });
  },

  createChat: async (userId: string, ownerId: string, shopId: string, initiatorName?: string): Promise<Chat> => {
    console.log('Attempting to create chat:', { userId, ownerId, shopId, initiatorName });
    if (!userId || !ownerId || !shopId) {
      console.error('Missing required fields for createChat:', { userId, ownerId, shopId });
      throw new Error('All fields (userId, ownerId, shopId) are required to start a chat');
    }

    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));
    
    let snapshot;
    try {
      snapshot = await getDocs(q);
      console.log('Found user chats:', snapshot.docs.length);
    } catch (error) {
      console.error('Error querying existing chats:', error);
      throw error;
    }
    
    const existing = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.shopId === shopId && data.participants.includes(ownerId);
    });
    
    if (existing) {
      console.log('Using existing chat:', existing.id);
      const data = existing.data();
      return {
        ...data,
        id: existing.id,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      } as Chat;
    }

    console.log('No existing chat found, creating new one...');
    const newChatData = {
      participants: [userId, ownerId],
      shopId,
      initiatorName: initiatorName || 'Customer',
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(chatsRef, newChatData);
      console.log('New chat created successfully:', docRef.id);
      
      return {
        id: docRef.id,
        ...newChatData,
        updatedAt: new Date().toISOString(),
      } as Chat;
    } catch (error) {
      console.error('Error adding new chat doc:', error);
      throw error;
    }
  },

  sendMessage: async (chatId: string, senderId: string, text: string): Promise<void> => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Add message
      await addDoc(messagesRef, {
        chatId,
        senderId,
        text,
        createdAt: serverTimestamp(),
      });

      // Update last message in chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      throw error;
    }
  }
};

// Keep deprecated mock for compatibility during migration if needed, but we'll update components
export const mockChatService = chatService;
