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

export const chatService = {
  getChats: async (userId: string): Promise<Chat[]> => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      } as Chat;
    });
  },
  
  onChatsChange: (userId: string, callback: (chats: Chat[]) => void) => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        } as Chat;
      });
      callback(chats);
    }, (error) => {
      console.error("Error listening to chats:", error);
    });
  },

  onMessagesChange: (chatId: string, callback: (messages: Message[]) => void) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));
    
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
    });
  },

  createChat: async (userId: string, ownerId: string, shopId: string): Promise<Chat> => {
    if (!userId || !ownerId || !shopId) {
      console.error('Missing required fields for createChat:', { userId, ownerId, shopId });
      throw new Error('All fields (userId, ownerId, shopId) are required to start a chat');
    }

    // Check if chat already exists
    // We query by participants array-contains userId first to get all user's chats
    // Then filter by shopId and ownerId in memory to avoid complex index requirements
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));
    
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch (error) {
      console.error('Error querying existing chats:', error);
      throw error;
    }
    
    const existing = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.shopId === shopId && data.participants.includes(ownerId);
    });
    
    if (existing) {
      const data = existing.data();
      return {
        ...data,
        id: existing.id,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      } as Chat;
    }

    const newChatData = {
      participants: [userId, ownerId],
      shopId,
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(chatsRef, newChatData);
    
    return {
      id: docRef.id,
      ...newChatData,
      updatedAt: new Date().toISOString(),
    } as Chat;
  },

  sendMessage: async (chatId: string, senderId: string, text: string): Promise<void> => {
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
  }
};

// Keep deprecated mock for compatibility during migration if needed, but we'll update components
export const mockChatService = chatService;
