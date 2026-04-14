import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChatWindow from '@/src/components/ChatWindow';
import { Message, UserProfile, Shop } from '@/src/types';
import { mockChatService } from '@/src/services/chatService';

interface ChatContainerProps {
  shop: Shop | null;
  chatId: string | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  recipientName?: string;
}

export default function ChatContainer({ shop, chatId, currentUser, onClose, recipientName }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    if (chatId) {
      const fetchMessages = async () => {
        try {
          const newMessages = await mockChatService.getMessages(chatId);
          if (isMounted) {
            // Only update state if messages have actually changed to avoid unnecessary re-renders
            setMessages(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
                return newMessages;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };

      fetchMessages();
      
      interval = setInterval(fetchMessages, 3000);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [chatId]);

  const handleSendMessage = async (text: string) => {
    if (!currentUser || !chatId) return;
    try {
      const newMessage = await mockChatService.sendMessage(chatId, currentUser.uid, text);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!chatId) return null;

  return (
    <ChatWindow
      messages={messages}
      currentUser={currentUser}
      onSendMessage={handleSendMessage}
      onClose={onClose}
      recipientName={recipientName || shop?.name || 'Chat'}
    />
  );
}
