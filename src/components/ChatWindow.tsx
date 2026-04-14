import React, { useState, useRef, useEffect } from 'react';
import { Message, UserProfile } from '@/src/types';
import { useTranslation } from 'react-i18next';
import { Send, X, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ChatWindowProps {
  messages: Message[];
  currentUser: UserProfile | null;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  recipientName: string;
}

export default function ChatWindow({ messages, currentUser, onSendMessage, onClose, recipientName }: ChatWindowProps) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Focus input when chat opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-[110] flex h-[500px] flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl sm:bottom-8 sm:right-8 sm:left-auto sm:w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold truncate max-w-[150px]">{recipientName}</h3>
            <p className="text-xs text-white/80">Online</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <div className="rounded-full bg-neutral-100 p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500 italic">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.uid;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-[85%] flex-col",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm shadow-sm break-words w-full",
                  isMe 
                    ? "bg-primary-600 text-white rounded-tr-none" 
                    : "bg-white text-neutral-900 rounded-tl-none border border-neutral-100"
                )}
              >
                {msg.text}
              </div>
              <span className="mt-1 text-[10px] text-neutral-400">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-100 p-4 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat')}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
