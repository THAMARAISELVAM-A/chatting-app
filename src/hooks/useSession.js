import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'stranger_chat_session';

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate nickname
 */
export function validateNickname(nickname) {
  const trimmed = nickname?.trim() || '';
  if (trimmed.length < 2) return { valid: false, error: 'At least 2 characters' };
  if (trimmed.length > 20) return { valid: false, error: 'Max 20 characters' };
  const blocked = ['admin', 'moderator', 'support', 'system', 'null', 'undefined', 'bot'];
  if (blocked.includes(trimmed.toLowerCase())) return { valid: false, error: 'Username taken' };
  return { valid: true };
}

/**
 * Session hook - manages anonymous user session
 */
export default function useSession() {
  const [session, setSession] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize session
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000) {
          setSession(parsed);
          setIsLoaded(true);
          return;
        }
      } catch (e) {
        console.error('Session parse error:', e);
      }
    }

    const newSession = {
      id: generateSessionId(),
      nickname: '',
      createdAt: Date.now(),
      blockedUsers: []
    };
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setIsLoaded(true);
  }, []);

  // Save session changes
  useEffect(() => {
    if (session && isLoaded) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }, [session, isLoaded]);

  // Set nickname
  const setNickname = useCallback((nickname) => {
    setSession(prev => prev ? { ...prev, nickname } : null);
  }, []);

  // Block user
  const blockUser = useCallback((blockedId) => {
    setSession(prev => {
      if (!prev) return prev;
      const blocked = prev.blockedUsers || [];
      if (blocked.includes(blockedId)) return prev;
      return { ...prev, blockedUsers: [...blocked, blockedId] };
    });
  }, []);

  // Check if blocked
  const isBlocked = useCallback((id) => {
    return session?.blockedUsers?.includes(id) || false;
  }, [session]);

  // Clear session
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return {
    session,
    isLoaded,
    setNickname,
    blockUser,
    isBlocked,
    clearSession
  };
}