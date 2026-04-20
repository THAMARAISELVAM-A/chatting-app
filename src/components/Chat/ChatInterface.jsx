import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberButton, ConnectionMeter } from '../UI/DesignSystem';
import { 
  Send, X, SkipForward, ShieldCheck, Zap, Gift, User, MoreVertical
} from 'lucide-react';

export default function ChatInterface({ 
  messages, 
  inputText, 
  setInputText, 
  onSend, 
  onSkip, 
  onEnd, 
  isTyping, 
  mood,
  strength,
  onSendGift
}) {
  const scrollRef = useRef(null);
  const [showGiftAnim, setShowGiftAnim] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessageTime(Date.now());
    }
  }, [messages]);

  const handleGift = () => {
    setShowGiftAnim(true);
    onSendGift();
    setTimeout(() => setShowGiftAnim(false), 2000);
  };

  const timeSinceLastMessage = Math.floor((Date.now() - lastMessageTime) / 1000);
  const showDisconnectWarning = timeSinceLastMessage > 30 && messages.length > 0;

  return (
    <motion.div 
      initial={{ scale: 1.05, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen flex relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -20, 0, 15, 0],
            x: [0, 15, -10, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 rounded-full bg-neon-cyan"
          style={{ filter: 'blur(60px)', top: '10%', left: '5%' }}
        />
        <motion.div
          animate={{ 
            y: [0, 25, 0, -20, 0],
            x: [0, -15, 10, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-80 h-80 rounded-full bg-purple-500"
          style={{ filter: 'blur(70px)', bottom: '20%', right: '10%' }}
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0, 10, 0],
            x: [0, 10, -5, 8, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-40 h-40 rounded-full bg-pink-400"
          style={{ filter: 'blur(40px)', top: '50%', right: '30%' }}
        />
      </div>

      {/* Mesh Shader Overlay */}
      <div className="mesh-shader opacity-20" />

      {/* Gift Animation Overlay */}
      <AnimatePresence>
        {showGiftAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 2 }}
            exit={{ opacity: 0, scale: 4 }}
            className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="w-64 h-64 bg-neon-cyan/20 blur-[100px] rounded-full" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Zap size={120} className="text-neon-cyan" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 relative z-10">
        
        {/* Chat Stream */}
        <div 
          className="flex-1 flex flex-col rounded-2xl overflow-hidden order-1"
          style={{
            background: 'rgba(10, 10, 15, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
           {/* Stream Header */}
           <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
               <div className="flex items-center gap-3">
                   <div className="relative">
                     <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(139, 92, 246, 0.15))',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                     >
                        <User size={18} className="text-white/70" />
                     </div>
                     <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black`}
                        style={{ background: isTyping ? '#ffaa00' : '#00ffaa' }}
                     />
                   </div>
                   <div>
                      <div className="text-sm font-semibold text-white">Stranger</div>
                      <div className="text-[11px] text-white/40 flex items-center gap-1.5">
                         {isTyping ? (
                           <span className="text-warning-amber">typing...</span>
                         ) : (
                           <>
                             <span>Online</span>
                             {showDisconnectWarning && (
                               <span className="text-error-rose">· {timeSinceLastMessage}s ago</span>
                             )}
                           </>
                         )}
                      </div>
                   </div>
               </div>
               <div className="flex items-center gap-2">
                  <CyberButton onClick={onSkip} variant="secondary" className="py-2 h-9 text-[10px] px-3">
                     Skip
                  </CyberButton>
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    className="p-2 rounded-full transition-colors hover:bg-white/5"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                     <MoreVertical size={18} />
                  </button>
               </div>
            </div>

            {/* Messages List */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            >
               {messages.length === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                       <User size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/30 text-sm">Say hello to start the conversation!</p>
                 </div>
               )}

               {messages.map((msg, index) => {
                 const isUser = msg.sender === 'user';
                 const isSystem = msg.sender === 'system';
                 const prevMsg = index > 0 ? messages[index - 1] : null;
                 const showAvatar = !isUser && !isSystem && (index === 0 || prevMsg?.sender === 'user');

                 if (isSystem) return (
                   <div key={msg.id} className="flex justify-center py-2">
                     <span 
                      className="text-[10px] font-medium text-white/40 px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                     >
                       {msg.text}
                     </span>
                   </div>
                 );

                 return (
                   <motion.div
                     key={msg.id}
                     initial={{ opacity: 0, y: 8, scale: 0.98 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     transition={{ duration: 0.2 }}
                     className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                   >
                     {!isUser && showAvatar && (
                       <div 
                        className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center self-end"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(139, 92, 246, 0.2))'
                        }}
                       >
                          <User size={12} className="text-white" />
                       </div>
                     )}
                     {!isUser && !showAvatar && <div className="w-8 shrink-0" />}
                     
                     <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`px-4 py-2.5 rounded-2xl ${
                            isUser 
                              ? 'text-deep-space rounded-br-md' 
                              : 'text-white/90 rounded-bl-md'
                          }`}
                          style={
                            isUser 
                              ? { 
                                  background: 'linear-gradient(135deg, #00f5ff, #00c4cc)',
                                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)'
                                }
                              : { 
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  backdropFilter: 'blur(10px)',
                                  WebkitBackdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)'
                                }
                          }
                        >
                           <p className="text-sm leading-relaxed">
                             {msg.text}
                           </p>
                        </div>
                        <div className="text-[10px] text-white/25 mt-1 px-1">
                           {msg.time}
                        </div>
                     </div>
                   </motion.div>
                 );
               })}

               {isTyping && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex gap-2"
                 >
                    <div 
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(139, 92, 246, 0.2))'
                      }}
                    >
                       <User size={12} className="text-white" />
                    </div>
                    <div 
                      className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                       {[0, 1, 2].map(i => (
                         <motion.div 
                           key={i}
                           animate={{ opacity: [0.3, 0.8, 0.3] }}
                           transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                           className="w-2 h-2 bg-white/50 rounded-full" 
                         />
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Input Interface */}
            <div className="p-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <div className="flex gap-2 items-center">
                  <CyberButton variant="secondary" onClick={handleGift} className="w-10 h-10 p-0 shrink-0">
                     <Gift size={16} />
                  </CyberButton>
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend?.()}
                    placeholder="Message..."
                    className="flex-1 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  />
                  <CyberButton onClick={onSend} className="w-10 h-10 p-0 rounded-full shrink-0">
                     <Send size={16} />
                  </CyberButton>
               </div>
            </div>
        </div>

        {/* Collapsible Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden md:flex w-[260px] flex-col gap-4 order-2 shrink-0"
            >
              <div 
                className="rounded-2xl p-5 flex flex-col gap-5"
                style={{
                  background: 'rgba(10, 10, 15, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="flex items-center justify-between">
                   <div className="text-xs text-white/40 uppercase tracking-wider">Chat Info</div>
                   <button 
                    onClick={() => setSidebarOpen(false)} 
                    className="text-white/30 hover:text-white transition-colors"
                   >
                      <X size={16} />
                   </button>
                </div>

                <ConnectionMeter strength={strength} />

                <div className="space-y-3">
                   <div 
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                   >
                      <span className="text-xs text-white/50">Status</span>
                      <div className="flex items-center gap-1.5">
                         <ShieldCheck size={12} className="text-success-emerald" />
                         <span className="text-xs text-success-emerald">Encrypted</span>
                      </div>
                   </div>
                   <div 
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                   >
                      <span className="text-xs text-white/50">Mood</span>
                      <span className="text-xs text-white capitalize">{mood}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                   <CyberButton variant="danger" onClick={onEnd} className="py-2.5 text-[11px]">
                      <X size={14} /> End
                   </CyberButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}