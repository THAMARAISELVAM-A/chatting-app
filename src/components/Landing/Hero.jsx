import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shield, MessageCircle } from 'lucide-react';

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

const floatOrb = {
  animate: {
    y: [0, -20, 0, 10, 0],
    x: [0, 10, -5, 15, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
  }
};

export default function Hero({ onGetStarted }) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
    >
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          variants={floatOrb}
          animate="animate"
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            top: '10%',
            left: '5%'
          }}
        />
        <motion.div
          variants={floatOrb}
          animate="animate"
          className="absolute w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '15%',
            right: '10%'
          }}
        />
        <motion.div
          variants={floatOrb}
          animate="animate"
          className="absolute w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
            top: '60%',
            left: '20%'
          }}
        />
      </div>

      {/* Logo and Title */}
      <motion.div variants={itemVariants} className="relative z-10 mb-8">
        <div 
          className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.2)'
          }}
        >
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(0, 245, 255, 0.3)', '0 0 40px rgba(0, 245, 255, 0.5)', '0 0 20px rgba(0, 245, 255, 0.3)']
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-3xl"
          />
          <MessageCircle size={40} className="text-neon-cyan relative z-10" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Stranger<span className="text-neon-cyan" style={{ textShadow: '0 0 30px rgba(0, 245, 255, 0.5)' }}>X</span>
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          Chat anonymously with strangers from around the world
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 max-w-md mb-10 relative z-10">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Users size={24} className="text-neon-cyan mb-2" />
          <div className="text-xl font-bold text-white">12K+</div>
          <div className="text-xs text-white/40">Online Now</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Zap size={24} className="text-warning-amber mb-2" />
          <div className="text-xl font-bold text-white">Instant</div>
          <div className="text-xs text-white/40">Matching</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Shield size={24} className="text-success-emerald mb-2" />
          <div className="text-xl font-bold text-white">100%</div>
          <div className="text-xs text-white/40">Anonymous</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <MessageCircle size={24} className="text-purple-400 mb-2" />
          <div className="text-xl font-bold text-white">AI</div>
          <div className="text-xs text-white/40">Powered</div>
        </motion.div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGetStarted}
        className="relative z-10 px-10 py-4 rounded-full text-lg font-semibold"
        style={{
          background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
          color: '#0a0a0f',
          boxShadow: '0 0 30px rgba(0, 245, 255, 0.3)'
        }}
      >
        <span className="relative z-10">Start Chatting</span>
        <motion.div
          animate={{ 
            boxShadow: ['0 0 20px rgba(0, 245, 255, 0.4)', '0 0 40px rgba(0, 245, 255, 0.6)', '0 0 20px rgba(0, 245, 255, 0.4)']
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 rounded-full"
        />
      </motion.button>

      <motion.p variants={itemVariants} className="text-white/30 text-xs mt-6 relative z-10">
        No login required · Completely free
      </motion.p>
    </motion.div>
  );
}