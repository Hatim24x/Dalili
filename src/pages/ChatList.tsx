import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, User, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { chatService } from '@/src/services/chatService';
import { shopService } from '@/src/services/shopService';
import { useAuth } from '@/src/context/AuthContext';
import ChatContainer from '@/src/components/ChatContainer';
import { Chat, Shop } from '@/src/types';

export default function ChatList() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState<(Chat & { displayName: string, shopObj?: Shop })[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ shop?: Shop, chatId: string, recipientName: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = chatService.onChatsChange(currentUser.uid, async (chatData) => {
      try {
        const shops = await shopService.getShops();
        
        const enrichedChats = chatData.map(chat => {
          const shop = shops.find(s => s.id === chat.shopId);
          
          let displayName = '';
          if (currentUser.role === 'owner') {
            // In a real app we'd fetch the user's name from their profile
            // For now, let's use a placeholder if we don't store it in the chat
            displayName = 'Customer';
          } else {
            displayName = shop?.name || 'Unknown Shop';
          }

          return {
            ...chat,
            displayName,
            shopObj: shop
          };
        });
        
        setChats(enrichedChats);
      } catch (error) {
        console.error('Failed to fetch enriched chats:', error);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

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
