import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, MessageCircle, ArrowRight } from 'lucide-react';
import { validateNickname } from '@/hooks/useSession';

interface LandingProps {
  onStart: (nickname: string) => void;
}

/**
 * Landing page - first screen users see
 * Big animated headline, nickname input, start button, online counter
 */
export default function Landing({ onStart }: LandingProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [onlineCount] = useState(() => Math.floor(Math.random() * 5000) + 8000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      setError(validation.error || 'Invalid nickname');
      return;
    }
    onStart(nickname.trim());
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--gradient-bg)' }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute w-96 h-96 rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 10, delay: 1 }}
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Talk to someone{' '}
            <span className="text-gradient">new</span>
          </h1>
          <p className="text-white/60 text-lg">
            Anonymous 1-on-1 chat. No accounts. No tracking.
          </p>
        </motion.div>

        {/* Nickname Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-white/70 mb-2">
                Choose a nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                placeholder="Stranger42"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {error && <p className="mt-2 text-sm text-error-rose">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg transition-all hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-glow))',
              }}
            >
              Start chatting
              <ArrowRight size={20} />
            </button>
          </form>
        </motion.div>

        {/* Online Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-white/50"
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-success-emerald animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-success-emerald animate-ping opacity-30" />
          </div>
          <span className="text-sm font-medium">
            {onlineCount.toLocaleString()} people online now
          </span>
        </motion.div>

        {/* Safety note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-white/40 max-w-sm mx-auto"
        >
          By chatting, you agree to our community guidelines. All chats are end-to-end encrypted.
        </motion.p>
      </div>

      {/* Bottom Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 left-0 right-0 px-6"
      >
        <div className="flex justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center text-white/40">
            <Shield size={20} className="mb-2" />
            <span className="text-xs">Encrypted</span>
          </div>
          <div className="flex flex-col items-center text-white/40">
            <MessageCircle size={20} className="mb-2" />
            <span className="text-xs">Anonymous</span>
          </div>
          <div className="flex flex-col items-center text-white/40">
            <Users size={20} className="mb-2" />
            <span className="text-xs">Random Pair</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
