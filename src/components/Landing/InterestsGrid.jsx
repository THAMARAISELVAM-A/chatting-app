import React from 'react';
import { motion } from 'framer-motion';

const INTERESTS = [
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'photography', label: 'Photo', emoji: '📷' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'coding', label: 'Coding', emoji: '👨‍💻' },
  { id: 'nature', label: 'Nature', emoji: '🌲' },
  { id: 'anime', label: 'Anime', emoji: '🎌' },
  { id: 'memes', label: 'Memes', emoji: '😂' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' }
];

export default function InterestsGrid({ selectedInterests, onToggle }) {
  return (
    <div className="relative">
      {/* Floating orbs background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div
          animate={{ 
            y: [0, -15, 0, 10, 0],
            x: [0, 10, -5, 8, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-32 h-32 rounded-full bg-neon-cyan"
          style={{ filter: 'blur(40px)', top: '0%', left: '10%' }}
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0, -15, 0],
            x: [0, -10, 5, -8, 0]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-40 h-40 rounded-full bg-purple-500"
          style={{ filter: 'blur(50px)', bottom: '10%', right: '5%' }}
        />
      </div>
      
      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 relative z-10">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <motion.button
              key={interest.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(interest.id)}
              className={`p-3 rounded-xl text-center relative overflow-hidden transition-all duration-300 ${
                isSelected ? 'border-2' : 'border-2 border-transparent hover:border-white/20'
              }`}
              style={{
                background: isSelected 
                  ? 'rgba(0, 245, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: isSelected 
                  ? 'rgba(0, 245, 255, 0.5)' 
                  : 'transparent',
                boxShadow: isSelected 
                  ? '0 0 20px rgba(0, 245, 255, 0.25)' 
                  : 'none',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              {/* Glow effect when selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.15) 0%, transparent 70%)'
                  }}
                />
              )}
              
              <div className="text-xl md:text-2xl mb-1 relative z-10">{interest.emoji}</div>
              <div 
                className={`text-[10px] md:text-xs relative z-10 transition-colors duration-300 ${
                  isSelected ? 'text-neon-cyan' : 'text-white/60'
                }`}
                style={{
                  textShadow: isSelected ? '0 0 10px rgba(0, 245, 255, 0.5)' : 'none'
                }}
              >
                {interest.label}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}