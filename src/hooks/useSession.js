import { useState, useEffect, useCallback } from 'react';
// Types imported from ../types/chat

const SESSION_KEY = 'whisper_session';
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Validate nickname: 2-20 chars, no profanity/slurs (basic check)
 */
export function validateNickname(nickname) {
  const trimmed = nickname.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Nickname must be at least 2 characters' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Nickname must be 20 characters or less' };
  }

  // Basic profanity filter - check for common slurs (case-insensitive)
  const blockedWords = [
    'nigger', 'faggot', 'cunt', 'fuck', 'shit', 'bitch', 'asshole',
    'nigga', 'retard', 'spic', 'kike', 'chink', 'wetback', 'tranny'
  ];

  const lower = trimmed.toLowerCase();
  for (const word of blockedWords) {
    if (lower.includes(word)) {
      return { valid: false, error: 'Nickname contains inappropriate content' };
    }
  }

  return { valid: true };
}

/**
 * Hook to manage anonymous user session
 */
export default function useSession() {
  const [session, setSession] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize or restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if session is still valid (not stale)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (parsed.createdAt > thirtyDaysAgo) {
          setSession(parsed);
          setIsLoaded(true);
          return;
        }
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }

    // Create new session
    const newSession = {
      id: generateSessionId(),
      nickname: '',
      createdAt: Date.now(),
      blockedUsers: [],
      lastSeen: Date.now(),
    };

    setSession(newSession);
    setIsLoaded(true);
  }, []);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }, [session]);

  // Update nickname
  const setNickname = useCallback((nickname) => {
    setSession(prev => prev ? { ...prev, nickname } : null);
  }, []);

  // Update last seen timestamp
  const updateLastSeen = useCallback(() => {
    setSession(prev => prev ? { ...prev, lastSeen: Date.now() } : null);
  }, []);

  // Block a user for 30 minutes
  const blockUser = useCallback((sessionId) => {
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockedUsers: [...prev.blockedUsers.filter(id => id !== sessionId), sessionId],
      };
    });

    // Remove from blocked list after 30 minutes
    setTimeout(() => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          blockedUsers: prev.blockedUsers.filter(id => id !== sessionId),
        };
      });
    }, BLOCK_DURATION);
  }, []);

  // Check if a user is blocked
  const isBlocked = useCallback(
    (sessionId) => {
      return session?.blockedUsers.includes(sessionId) ?? false;
    },
    [session]
  );

  // Clear session (logout)
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return {
    session,
    isLoaded,
    setNickname,
    updateLastSeen,
    blockUser,
    isBlocked,
    clearSession,
  };
}
