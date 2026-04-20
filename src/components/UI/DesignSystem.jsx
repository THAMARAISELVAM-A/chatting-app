import React from 'react';
import { motion } from 'framer-motion';

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const GlassCard = ({ children, className = "", delay = 0, glow = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`bg-surface-glass backdrop-blur-lg border border-glass-border rounded-2xl p-6 md:p-8 relative overflow-hidden ${glow ? 'shadow-glow-cyan' : ''} ${className}`}
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}
  >
    {glow && (
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
        background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%)'
      }} />
    )}
    <div style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }} />
    {children}
  </motion.div>
);

export const HUDCard = ({ children, className = "", delay = 0, glitch = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      animation: glitch ? "glitch 0.3s ease-in-out infinite" : "none"
    }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden ${className}`}
    style={{
      background: 'rgba(10, 10, 15, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
    }}
  >
    <div style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }} />
    {children}
  </motion.div>
);

export const GlowButton = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false, glow = false }) => {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
      color: '#0a0a0f',
      border: 'none'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    },
    danger: {
      background: 'rgba(255, 45, 85, 0.1)',
      color: '#ff2d55',
      border: '1px solid rgba(255, 45, 85, 0.3)'
    },
    warning: {
      background: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00',
      border: '1px solid rgba(255, 170, 0, 0.3)'
    }
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 ${className}`}
      style={{
        ...style,
        boxShadow: glow && !disabled ? '0 0 30px rgba(0, 245, 255, 0.3)' : 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : children}
    </motion.button>
  );
};

export const CyberButton = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false }) => {
  const variantStyles = {
    primary: {
      background: 'rgba(0, 245, 255, 0.1)',
      color: '#00f5ff',
      border: '2px solid rgba(0, 245, 255, 0.3)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'rgba(255, 255, 255, 0.6)',
      border: '2px solid rgba(255, 255, 255, 0.15)'
    },
    danger: {
      background: 'rgba(255, 45, 85, 0.1)',
      color: '#ff2d55',
      border: '2px solid rgba(255, 45, 85, 0.3)'
    },
    warning: {
      background: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00',
      border: '2px solid rgba(255, 170, 0, 0.3)'
    }
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2.5 rounded-full font-medium text-xs transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 ${className}`}
      style={{
        ...style,
        cursor: disabled || loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : children}
    </motion.button>
  );
};

export const HUDInput = ({ value, onChange, placeholder, icon: Icon, className = "" }) => (
  <div className={`relative flex items-center group ${className}`}>
    {Icon && (
      <div className="absolute left-4 text-white/30 group-hover:text-white transition-colors">
        <Icon size={16} />
      </div>
    )}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 ${Icon ? 'pl-11' : 'px-4'} pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all`}
    />
  </div>
);

export const GlassInput = ({ value, onChange, placeholder, onKeyDown, className = "" }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    className={`w-full bg-surface-glass backdrop-blur-md border border-glass-border rounded-full px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all duration-300 ${className}`}
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}
  />
);

export const ConnectionMeter = ({ strength }) => {
  const getColor = () => {
    if (strength < 30) return '#ff2d55';
    if (strength < 60) return '#ffaa00';
    return '#00ffaa';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-medium text-white/40">
        <span>Connection</span>
        <span style={{ color: getColor() }}>{strength}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ 
            backgroundColor: getColor(),
            boxShadow: `0 0 10px ${getColor()}`
          }}
        />
      </div>
    </div>
  );
};

export const GlitchText = ({ children, className = "" }) => (
  <span className={`inline-block animate-[chromatic-aberration_1s_infinite] ${className}`}>
    {children}
  </span>
);

export const IconButton = ({ icon: Icon, onClick, variant = 'default', className = "", size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  const variants = {
    default: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    primary: {
      background: 'rgba(0, 245, 255, 0.1)',
      border: '1px solid rgba(0, 245, 255, 0.3)'
    }
  };
  
  const style = variants[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`rounded-full flex items-center justify-center transition-colors ${sizes[size]} ${className}`}
      style={{
        ...style,
        cursor: 'pointer'
      }}
    >
      <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="text-white/70" />
    </motion.button>
  );
};

export const FloatingOrb = ({ size = 120, color = 'cyan', className = '' }) => {
  const colors = {
    cyan: {
      background: 'radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%)',
      boxShadow: '0 0 60px rgba(0, 245, 255, 0.3)'
    },
    purple: {
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
      boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)'
    },
    pink: {
      background: 'radial-gradient(circle, rgba(244, 114, 182, 0.4) 0%, transparent 70%)',
      boxShadow: '0 0 60px rgba(244, 114, 182, 0.3)'
    }
  };

  const style = colors[color];

  return (
    <motion.div
      animate={{ 
        y: [0, -20, 0],
        x: [0, 10, 0]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        ...style
      }}
    />
  );
};