import { Message, Chat } from '@/src/types';

const CHATS_KEY = 'qareeb_chats';
const MESSAGES_KEY = 'qareeb_messages';

export const mockChatService = {
  getChats: async (userId: string): Promise<Chat[]> => {
    const stored = localStorage.getItem(CHATS_KEY);
    const chats: Chat[] = stored ? JSON.parse(stored) : [];
    // Filter chats where the user is a participant
    return chats.filter(c => c.participants.includes(userId));
  },
  
  getMessages: async (chatId: string): Promise<Message[]> => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const messages: Message[] = stored ? JSON.parse(stored) : [];
    return messages.filter(m => m.chatId === chatId);
  },

  createChat: async (userId: string, ownerId: string, shopId: string): Promise<Chat> => {
    const stored = localStorage.getItem(CHATS_KEY);
    const chats: Chat[] = stored ? JSON.parse(stored) : [];
    
    // Check if chat already exists
    const existing = chats.find(c => 
      c.participants.includes(userId) && 
      c.participants.includes(ownerId) && 
      c.shopId === shopId
    );
    
    if (existing) return existing;

    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      participants: [userId, ownerId],
      shopId,
      updatedAt: new Date().toISOString(),
    };

    const updatedChats = [...chats, newChat];
    localStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    return newChat;
  },

  sendMessage: async (chatId: string, senderId: string, text: string): Promise<Message> => {
    const storedMessages = localStorage.getItem(MESSAGES_KEY);
    const messages: Message[] = storedMessages ? JSON.parse(storedMessages) : [];
    
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      chatId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, newMessage];
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));

    // Update last message in chat
    const storedChats = localStorage.getItem(CHATS_KEY);
    const chats: Chat[] = storedChats ? JSON.parse(storedChats) : [];
    const updatedChats = chats.map(c => c.id === chatId ? { 
      ...c, 
      lastMessage: text, 
      updatedAt: new Date().toISOString() 
    } : c);
    localStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));

    return newMessage;
  }
};
