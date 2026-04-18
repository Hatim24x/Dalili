import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChatWindow from '@/src/components/ChatWindow';
import { Message, UserProfile, Shop } from '@/src/types';
import { chatService } from '@/src/services/chatService';

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
    if (!chatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.onMessagesChange(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (text: string) => {
    if (!currentUser || !chatId) return;
    try {
      await chatService.sendMessage(chatId, currentUser.uid, text);
      // No need to manually update state, onMessagesChange will pick it up
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
