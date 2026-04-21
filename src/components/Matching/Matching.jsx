import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MatchingProps {
  nickname: string;
  onCancel: () => void;
  onMatched: (roomId: string, partnerSession: string, partnerNick: string) => void;
}

/**
 * Matching screen - shows animated indicator while searching for a partner
 * Features: pulsing indigo orb, cancel button, auto-transition on match
 */
export default function Matching({ nickname, onCancel, onMatched }: MatchingProps) {
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--gradient-bg)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Multiple pulsing orbs for visual interest */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute w-64 h-64 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.6) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ repeat: Infinity, duration: 5, delay: 0.5 }}
          className="absolute w-48 h-48 rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
            top: '40%',
            left: '60%',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Pulsing orb indicator */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 40px rgba(79, 70, 229, 0.4)',
              '0 0 80px rgba(79, 70, 229, 0.7)',
              '0 0 40px rgba(79, 70, 229, 0.4)',
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
          className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--primary), var(--primary-glow))',
          }}
        />

        {/* Status text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          Looking for a stranger{dots}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 max-w-sm mx-auto"
        >
          Searching for someone to chat with. This usually takes a few seconds.
        </motion.p>

        {/* Nickname display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
        >
          <span className="text-sm text-white/60">Chatting as</span>
          <span className="text-sm font-semibold text-white">{nickname}</span>
        </motion.div>

        {/* Cancel button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onCancel}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <X size={20} />
          Cancel
        </motion.button>
      </div>
    </div>
  );
}
