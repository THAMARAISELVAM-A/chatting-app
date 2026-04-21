/**
 * Chat System Types
 * Based on the specification: Real-time anonymous chat with random pairing
 */

// User session - anonymous, stored in localStorage
export interface ChatSession {
  id: string;
  nickname: string;
  createdAt: number;
  blockedUsers: string[]; // Session IDs to block (30 min cooldown)
  lastSeen: number;
}

// Room - paired conversation between two users
export interface ChatRoom {
  id: string;
  user_a: string; // session_id
  user_b: string; // session_id
  status: 'active' | 'ended';
  created_at: string;
}

// Message - stored temporarily, purged when room ends
export interface ChatMessage {
  id?: string;
  room_id: string;
  sender_session_id: string;
  nickname: string;
  content: string;
  image_url?: string;
  created_at: string;
}

// Typing indicator - realtime broadcast
export interface TypingIndicator {
  room_id: string;
  session_id: string;
  is_typing: boolean;
}

// Realtime event types
export type RealtimeEvent =
  | { type: 'message'; payload: ChatMessage }
  | { type: 'typing'; payload: TypingIndicator }
  | { type: 'room_closed'; payload: { room_id: string } };

// App stage state
export type AppStage =
  | { kind: 'landing' }
  | { kind: 'matching'; nickname: string }
  | {
      kind: 'chat';
      nickname: string;
      roomId: string;
      partnerSession: string;
      partnerNick: string;
    };

// Matching queue entry (for database)
export interface QueueEntry {
  session_id: string;
  nickname: string;
  queued_at: string;
}

// Report entry
export interface Report {
  id?: string;
  reporter_session: string;
  reported_session: string;
  room_id: string;
  reason: string;
  created_at: string;
}
