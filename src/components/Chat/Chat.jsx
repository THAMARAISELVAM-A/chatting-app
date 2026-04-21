import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Smile,
  Send,
  SkipForward,
  LogOut,
  MoreVertical,
  X,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ChatMessage, AppStage } from '@/types/chat';

interface ChatProps {
  roomId: string;
  mySessionId: string;
  partnerSession: string;
  partnerNick: string;
  myNickname: string;
  onSkip: () => void;
  onLeave: () => void;
}

/**
 * Chat screen - main conversation interface
 * Features: message bubbles, timestamps, typing indicator, image upload, emoji picker, skip/leave
 */
export default function Chat({
  roomId,
  partnerSession,
  partnerNick,
  myNickname,
  onSkip,
  onLeave,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages(prev => [...prev, msg]);
        }
      )
      .subscribe();

    // Load initial messages
    loadMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  // Typing indicator for self
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Broadcast typing
    supabase
      .channel(`typing-${roomId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { room_id: roomId, session_id: mySessionId, is_typing: true },
      });

    // Debounce - stop typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      supabase
        .channel(`typing-${roomId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { room_id: roomId, session_id: mySessionId, is_typing: false },
        });
    }, 2000);
  };

  // Listen for partner typing
  useEffect(() => {
    const channel = supabase.channel(`typing-${roomId}`);

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.session_id === partnerSession) {
          setPartnerTyping(payload.payload.is_typing);
        }
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [roomId, partnerSession]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Load initial messages
  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data);
    }
  };

  // Send message
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      sender_session_id: mySessionId,
      nickname: myNickname,
      content: trimmed,
    });

    if (error) {
      console.error('Failed to send message:', error);
      return;
    }

    setInputText('');
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setImageUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);

      // Send message with image
      await supabase.from('messages').insert({
        room_id: roomId,
        sender_session_id: mySessionId,
        nickname: myNickname,
        content: '',
        image_url: urlData.publicUrl,
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Emoji picker (simple version - can be expanded)
  const emojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '🎉', '❤️', '🔥', '💯'];

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Report partner
  const handleReport = async () => {
    await supabase.from('reports').insert({
      reporter_session: partnerSession,
      reported_session: partnerSession,
      room_id: roomId,
      reason: 'User reported from chat',
    });
    setShowMenu(false);
    onLeave();
  };

  // Format timestamp
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col relative bg-[#0a0a1a]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e5a] bg-[#141432]/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">{partnerNick[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-semibold text-white">{partnerNick}</h2>
            <p className="text-xs text-white/60">
              {partnerTyping ? 'typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.sender_session_id === partnerSession;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-[#1e1e5a] text-white rounded-bl-none'
                  }`}
                >
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="Shared"
                      className="rounded-lg mb-2 max-w-full"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  <p className="text-xs text-white/50 mt-1 text-right">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Partner typing indicator */}
        <AnimatePresence>
          {partnerTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/50 text-sm"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{partnerNick} is typing</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#1e1e5a] bg-[#141432]/80 backdrop-blur-lg p-4">
        <div className="flex items-end gap-2">
          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            disabled={imageUploading}
          >
            <Paperclip size={20} />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a1a] border border-[#1e1e5a] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-2 rounded-xl bg-[#141432] border border-[#1e1e5a] grid grid-cols-6 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 text-lg hover:bg-white/10 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Smile size={20} />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Menu Modal */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141432] rounded-2xl p-6 w-80 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Chat Options</h3>
                <button onClick={() => setShowMenu(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onSkip}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                >
                  <SkipForward size={20} />
                  <span>Skip to next person</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowLeaveDialog(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-error-rose/10 hover:bg-error-rose/20 transition-colors text-error-rose"
                >
                  <LogOut size={20} />
                  <span>Leave chat</span>
                </button>

                <button
                  onClick={handleReport}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-warning-amber/10 hover:bg-warning-amber/20 transition-colors text-warning-amber"
                >
                  <AlertTriangle size={20} />
                  <span>Report user</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave confirmation dialog */}
      <AnimatePresence>
        {showLeaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLeaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141432] rounded-2xl p-6 w-80 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white">Leave this chat?</h3>
              <p className="text-white/60 text-sm">
                You'll be returned to the home screen.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveDialog(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onLeave}
                  className="flex-1 px-4 py-3 rounded-xl bg-error-rose text-white hover:bg-error-rose/90 transition-colors"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
