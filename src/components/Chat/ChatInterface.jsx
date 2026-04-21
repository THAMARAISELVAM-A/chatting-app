import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberButton, ConnectionMeter } from '../UI/DesignSystem';
import { 
  Send, X, SkipForward, ShieldCheck, Zap, Gift, User, MoreVertical,
  MapPin, Clock, Smile, Activity, RefreshCw, Globe, Cpu, Lock
} from 'lucide-react';

const MOOD_ICONS = {
  FRIENDLY: { icon: '😊', label: 'Friendly' },
  SKEPTICAL: { icon: '🤨', label: 'Skeptical' },
  MYSTERIOUS: { icon: '👻', label: 'Mysterious' },
  CHAOTIC: { icon: '🤪', label: 'Chaotic' }
};

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍'];

const SHARED_INTERESTS = ['gaming', 'music', 'movies', 'tech', 'sports'];

import { sounds } from '../../utils/audio';

// ... (existing SHARED_INTERESTS etc) ...

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
  userName,
  strangerName,
  userInterests = [],
  onSendGift,
  onReport,
  energy = 100 
}) {
  const scrollRef = useRef(null);
  const [showGiftAnim, setShowGiftAnim] = useState(false);
  const [tickerText, setTickerText] = useState('PROTOCOL_UPLINK :: SECURE');
  
  // Synthetic notification sounds
  const lastMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > lastMsgCount.current) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === 'stranger') {
            sounds.incoming();
        } else {
            sounds.outgoing();
        }
    }
    lastMsgCount.current = messages.length;
    
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleGiftClick = () => {
    const success = onSendGift();
    if (success) {
      sounds.gift();
      setShowGiftAnim(true);
      setTimeout(() => setShowGiftAnim(false), 2000);
    } else {
      sounds.alert();
    }
  };

  const handleReport = () => {
    onReport();
  };

  // Live ticker simulation
  useEffect(() => {
    const logs = [
      'ENCRYPT_CHANNEL :: ACTIVE',
      'NODE_042 :: STABLE',
      'PACKET_TRACE :: 0.04ms',
      'SIGNAL_LOCK :: 98.4%',
      'NEURAL_MAP :: SYNCING',
      'ANALYZE_UPLINK :: OK',
      'RELAY_STABILITY :: 100%',
      'ECC_ENCRYPT :: VERIFIED'
    ];
    const tickerInterval = setInterval(() => {
        setTickerText(logs[Math.floor(Math.random() * logs.length)]);
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessageTime(Date.now());
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  const handleGift = () => {
    setShowGiftAnim(true);
    onSendGift();
    setTimeout(() => setShowGiftAnim(false), 2000);
  };

  const handleReport = () => {
    alert("User reported. Our AI moderators are now monitoring this chat.");
    setSidebarOpen(false);
  };

  const timeSinceLastMessage = Math.floor((Date.now() - lastMessageTime) / 1000);
  const showDisconnectWarning = timeSinceLastMessage > 45 && messages.length > 0;

  const currentMood = MOOD_ICONS[mood] || MOOD_ICONS.FRIENDLY;

  // Filter SHARED_INTERESTS to show some overlaps if user selected any
  const displayInterests = userInterests.length > 0 
    ? [...new Set([...userInterests.sl  return (
    <motion.div 
      initial={{ scale: 1.05, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen flex relative overflow-hidden"
      style={{ background: '#08080c' }}
    >
      {/* Cinematic HUD Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="mesh-shader animated opacity-40" />
        <motion.div
           animate={{ 
             opacity: [0.1, 0.3, 0.1],
           }}
           transition={{ repeat: Infinity, duration: 4 }}
           className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"
        />
      </div>

      {/* Main Chat HUD Overlay */}
      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-6 gap-4 md:gap-6 relative z-10">
        
        {/* Left Side: Video Mockup & Status */}
        <div className="hidden lg:flex w-72 xl:w-80 flex-col gap-6">
           {/* Self View Mockup */}
           <div 
             className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group"
             style={{ background: 'rgba(10, 10, 15, 0.8)' }}
           >
              <div className="absolute inset-0 flex items-center justify-center">
                 <User size={48} className="text-white/5 opacity-50" />
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                   transition={{ repeat: Infinity, duration: 3 }}
                   className="absolute inset-0 bg-neon-cyan/5 blur-3xl rounded-full"
                 />
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute inset-0 bg-[rgba(0,245,255,0.02)] mix-blend-overlay" />
                 <motion.div 
                   animate={{ top: ['0%', '100%'] }}
                   transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                   className="absolute left-0 right-0 h-px bg-white/10"
                 />
              </div>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-error-rose animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Local Node</span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                 <div className="text-[8px] font-mono text-white/30 space-y-0.5 uppercase">
                    <div>P_ID: {userName.replace(' ', '_').toUpperCase()}</div>
                    <div>FPS: 24.0</div>
                 </div>
                 <ShieldCheck size={14} className="text-success-emerald opacity-50" />
              </div>
           </div>

           {/* Stranger Mockup (Static) */}
           <div 
             className="relative aspect-video rounded-3xl overflow-hidden border border-white/5"
             style={{ background: 'rgba(10, 10, 15, 0.4)' }}
           >
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center space-y-2">
                    <RefreshCw className="text-white/5 mx-auto animate-spin" style={{ animationDuration: '6s' }} size={32} />
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10">Remote Protocol Stalled</div>
                 </div>
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-white/10" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Remote Node</span>
              </div>
           </div>

           {/* Protocol Status Widget */}
           <div 
             className="flex-1 p-6 rounded-[32px] border border-white/5 flex flex-col gap-6"
             style={{ background: 'rgba(10, 10, 15, 0.4)', backdropFilter: 'blur(20px)' }}
           >
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Relay Integrity</span>
                  <Activity size={14} className="text-neon-cyan" />
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-white/40">Core Stability</span>
                        <span className={energy < 30 ? 'text-error-rose' : 'text-neon-cyan'}>{energy}%</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${energy}%` }}
                          className={`h-full shadow-[0_0_100px_rgba(0,245,255,0.5)] transition-all ${energy < 30 ? 'bg-error-rose' : 'bg-neon-cyan'}`}
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-white/40">Latency</span>
                        <span className="text-cyber-purple">24ms</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          className="h-full bg-cyber-purple shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                        />
                     </div>
                  </div>
               </div>

               <div className="mt-auto pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Region</span>
                     <div className="flex items-center gap-2">
                        <Globe size={12} className="text-white/40" />
                        <span className="text-[10px] font-bold text-white/60">GLOBAL</span>
                     </div>
                  </div>
                  <div className="space-y-1 text-right">
                     <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Hardware</span>
                     <div className="flex items-center justify-end gap-2">
                        <Cpu size={12} className="text-white/40" />
                        <span className="text-[10px] font-bold text-white/60">H_CORE</span>
                     </div>
                  </div>
               </div>
           </div>
        </div>
        
        {/* Chat Stream Area */}
        <div 
          className="flex-1 flex flex-col rounded-[32px] overflow-hidden order-1 shadow-2xl relative"
          style={{
            background: 'rgba(10, 10, 15, 0.4)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
           {/* Cinematic Scroll Indicator */}
           <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
           {/* Knot.Chat-Style Header */}
           <div 
            className="px-6 py-5 flex items-center justify-between"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
               <div className="flex items-center gap-3">
                   <div className="relative">
                     <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center p-[2px]"
                      style={{
                        background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                      }}
                     >
                        <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                            <User size={18} className="text-white/70" />
                        </div>
                     </div>
                     <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black`}
                        style={{ background: isTyping ? '#ffaa00' : '#00ffaa' }}
                     />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        {strangerName}
                        <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse" />
                      </div>
                      <div className="text-[10px] text-white/40 flex items-center gap-2 font-medium">
                         {isTyping ? (
                           <span className="text-warning-amber">ghost typing...</span>
                         ) : (
                           <>
                             <span className="flex items-center gap-1">
                               <MapPin size={10} />Node_042
                             </span>
                             <span>·</span>
                             <span className="flex items-center gap-1">
                               <Smile size={10} />{currentMood.icon}
                             </span>
                           </>
                         )}
                      </div>
                   </div>
               </div>
               <div className="flex items-center gap-2">
                   <span className="text-[10px] text-white/30 mr-2 hidden md:block font-bold tracking-widest uppercase">
                     ESC to Skip
                   </span>
                   <CyberButton onClick={onSkip} variant="secondary" className="py-2 h-9 text-[10px] px-3 font-bold uppercase tracking-wider">
                      Skip
                   </CyberButton>
                   <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    className={`p-2 rounded-full transition-all ${sidebarOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`}
                  >
                      <MoreVertical size={18} />
                   </button>
               </div>
            </div>

            {/* Common Interests Bar */}
            <div 
              className="px-4 py-2 flex items-center gap-2 flex-wrap"
              style={{
                background: 'rgba(0, 245, 255, 0.02)',
                borderBottom: '1px solid rgba(0, 245, 255, 0.05)'
              }}
            >
               <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
                 {displayInterests.length > 0 ? 'Neural Match Matrix:' : 'Random Signal Uplink:'}
               </span>
               {displayInterests.map(interest => (
                 <span 
                   key={interest}
                   className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                   style={{
                     background: 'rgba(0, 245, 255, 0.08)',
                     color: '#00f5ff',
                     border: '1px solid rgba(0, 245, 255, 0.15)'
                   }}
                 >
                   {interest}
                 </span>
               ))}
            </div>

            {/* Messages List */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
            >
               {messages.length === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
                      }}
                    >
                       <User size={32} className="text-white/10" />
                    </motion.div>
                    <p className="text-white/30 text-sm font-medium tracking-wide">
                        Secure connection established.<br/>
                        <span className="text-xs opacity-50">Say hello to {strangerName}</span>
                    </p>
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
                      className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-4 py-1.5 rounded-full border border-white/5"
                      style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                     >
                       {msg.text}
                     </span>
                   </div>
                 );

                 return (
                   <motion.div
                     key={msg.id}
                     initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.3 }}
                     className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                   >
                     <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`px-4 py-3 rounded-2xl ${
                            isUser 
                              ? 'text-deep-space rounded-tr-none' 
                              : 'text-white/90 rounded-tl-none'
                          }`}
                          style={
                            isUser 
                              ? { 
                                  background: 'linear-gradient(135deg, #00f5ff, #00c4cc)',
                                  boxShadow: '0 4px 15px rgba(0, 245, 255, 0.3)',
                                  fontWeight: 600
                                }
                              : { 
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)'
                                }
                          }
                        >
                           <p className="text-sm leading-relaxed whitespace-pre-wrap">
                             {msg.text}
                           </p>
                        </div>
                        <div className="text-[9px] font-bold text-white/20 mt-1.5 px-1 uppercase tracking-widest">
                           {msg.time} {isUser && '· TRANSMITTED'}
                        </div>
                     </div>
                   </motion.div>
                 );
               })}

               {isTyping && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex gap-3"
                 >
                    <div className="w-8 shrink-0 flex flex-col justify-end pb-1">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center opacity-50"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                           <User size={12} className="text-white/50" />
                        </div>
                    </div>
                    <div 
                      className="px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                       {[0, 1, 2].map(i => (
                         <motion.div 
                           key={i}
                           animate={{ 
                             scale: [1, 1.5, 1],
                             opacity: [0.3, 1, 0.3],
                             backgroundColor: ['#fff', '#00f5ff', '#fff']
                           }}
                           transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                           className="w-1.5 h-1.5 rounded-full" 
                         />
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Input Interface */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center">
                      <div className="text-[9px] font-bold text-neon-cyan/40 mb-1 uppercase tracking-tighter">PROTOCOL GIFT</div>
                      <CyberButton 
                        variant="secondary" 
                        onClick={handleGiftClick} 
                        disabled={energy < 20}
                        className="w-11 h-11 p-0 shrink-0 rounded-xl"
                      >
                         <Gift size={18} className={energy >= 20 ? "text-neon-cyan" : "text-white/20"} />
                      </CyberButton>
                  </div>
                  <div className="flex-1 relative group">
                      <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend?.()}
                        placeholder={`Message as ${userName}...`}
                        className="w-full rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <CyberButton onClick={onSend} className="w-10 h-10 p-0 rounded-xl bg-neon-cyan shadow-lg shadow-neon-cyan/20">
                            <Send size={18} className="text-black" />
                         </CyberButton>
                      </div>
                  </div>
               </div>
            </div>
           {/* Live Protocol Ticker */}
           <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center px-6 overflow-hidden z-20">
              <motion.div 
                animate={{ x: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full bg-neon-cyan/40 mr-3 shrink-0"
              />
              <AnimatePresence mode="wait">
                <motion.span 
                  key={tickerText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] whitespace-nowrap"
                >
                  {tickerText}
                </motion.span>
              </AnimatePresence>
           </div>
        </div>

        {/* Collapsible Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden lg:flex w-[300px] flex-col gap-4 order-2 shrink-0"
            >
              <div 
                className="rounded-2xl p-6 flex flex-col gap-6"
                style={{
                  background: 'rgba(10, 10, 15, 0.6)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="flex items-center justify-between">
                   <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Operator Dashboard</div>
                   <button 
                     onClick={() => setSidebarOpen(false)} 
                     className="p-1.5 hover:bg-white/5 rounded-full text-white/30 hover:text-white transition-all"
                   >
                       <X size={16} />
                   </button>
                </div>

                <div className="space-y-4">
                   <div 
                    className="flex flex-col gap-1 p-4 rounded-xl border border-white/5"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                   >
                      <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Connection Status</span>
                      <div className="flex items-center gap-2">
                         <ShieldCheck size={14} className="text-success-emerald" />
                         <span className="text-xs text-white font-bold tracking-tight">Quantum Encrypted</span>
                      </div>
                      <div className="mt-2">
                        <ConnectionMeter strength={strength} />
                      </div>
                   </div>

                   <div 
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                   >
                      <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Current Mood</span>
                      <span className="text-xs text-white font-bold flex items-center gap-1.5">
                        <span className="text-lg leading-none">{currentMood.icon}</span>
                        {currentMood.label}
                      </span>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                   <div className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] pl-1">Actions</div>
                   <div className="grid grid-cols-1 gap-2">
                      <CyberButton variant="danger" onClick={handleReport} className="w-full py-3 text-[10px] font-black uppercase tracking-widest">
                         Report Operator
                      </CyberButton>
                      <button 
                        onClick={onEnd}
                        className="w-full py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-[#ff2d55]/40 hover:text-[#ff2d55] hover:bg-[#ff2d55]/10 border border-[#ff2d55]/10 transition-all"
                      >
                         End Transmission
                      </button>
                   </div>
                </div>
              </div>

              <div 
                 className="mt-auto p-6 rounded-2xl border border-white/5 text-center"
                 style={{ background: 'rgba(10, 10, 15, 0.3)' }}
              >
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm text-white/60 font-black italic">{userName}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
