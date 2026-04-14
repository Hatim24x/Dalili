import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, User, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { mockChatService } from '@/src/services/chatService';
import { mockShopService } from '@/src/services/shopService';
import { authService } from '@/src/services/authService';
import ChatContainer from '@/src/components/ChatContainer';
import { Chat, Shop } from '@/src/types';

export default function ChatList() {
  const { t } = useTranslation();
  const [chats, setChats] = useState<(Chat & { displayName: string, shopObj?: Shop })[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ shop?: Shop, chatId: string, recipientName: string } | null>(null);
  
  // Use useMemo to prevent re-triggering effects if the user object is technically "new" but data is same
  const currentUser = React.useMemo(() => authService.getCurrentUser(), []);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchChats = async () => {
      if (!currentUser) return;

      try {
        const chatData = await mockChatService.getChats(currentUser.uid);
        const shops = await mockShopService.getShops();
        const users = authService.getRegisteredUsers();
        
        const enrichedChats = chatData.map(chat => {
          const shop = shops.find(s => s.id === chat.shopId);
          
          let displayName = '';
          if (currentUser.role === 'owner') {
            const customerId = chat.participants.find(p => p !== currentUser.uid);
            const customer = users.find(u => u.uid === customerId);
            displayName = customer?.displayName || 'Customer';
          } else {
            displayName = shop?.name || 'Unknown Shop';
          }

          return {
            ...chat,
            displayName,
            shopObj: shop
          };
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        if (isMounted) {
          setChats(prev => {
            // Only update if data changed to prevent unnecessary re-renders
            if (JSON.stringify(prev) !== JSON.stringify(enrichedChats)) {
              return enrichedChats;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    fetchChats();
    interval = setInterval(fetchChats, 5000); // Poll every 5 seconds for list updates

    return () => { 
      isMounted = false; 
      if (interval) clearInterval(interval);
    };
  }, [currentUser?.uid]); // Use uid as dependency for stability

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{t('chat')}</h1>
        <p className="text-neutral-500">
          {currentUser.role === 'owner' ? 'Your conversations with customers' : 'Your conversations with shop owners'}
        </p>
      </div>

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {chats.length > 0 ? chats.map((chat) => (
          <motion.button
            key={chat.id}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            onClick={() => setSelectedChat({ shop: chat.shopObj, chatId: chat.id, recipientName: chat.displayName })}
            className="flex w-full items-center gap-4 p-4 transition-colors"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User className="h-8 w-8" />
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">{chat.displayName}</h3>
                <span className="text-xs text-neutral-400">
                  {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-neutral-500 line-clamp-1">{chat.lastMessage || 'No messages yet'}</p>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-neutral-300" />
          </motion.button>
        )) : (
          <div className="p-8 text-center text-neutral-500 italic">No conversations yet.</div>
        )}
      </div>

      <ChatContainer 
        shop={selectedChat?.shop || null}
        chatId={selectedChat?.chatId || null}
        recipientName={selectedChat?.recipientName}
        currentUser={currentUser}
        onClose={() => setSelectedChat(null)}
      />
    </div>
  );
}
