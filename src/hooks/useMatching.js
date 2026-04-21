import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatRoom, ChatMessage } from '@/types/chat';

interface UseMatchingReturn {
  isSearching: boolean;
  room: ChatRoom | null;
  partnerSession: string | null;
  partnerNick: string | null;
  messages: ChatMessage[];
  error: string | null;
  startMatching: (nickname: string) => Promise<void>;
  cancelMatching: () => void;
  leaveRoom: () => Promise<void>;
  sendMessage: (content: string, imageUrl?: string) => Promise<void>;
  markTyping: (isTyping: boolean) => void;
  isPartnerTyping: boolean;
  reportPartner: (reason: string) => Promise<void>;
}

/**
 * Hook for managing the matching queue and chat room
 * Uses Supabase Realtime for instant pairing and messaging
 */
export default function useMatching(sessionId: string): UseMatchingReturn {
  const [isSearching, setIsSearching] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [partnerSession, setPartnerSession] = useState<string | null>(null);
  const [partnerNick, setPartnerNick] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const channelRef = useRef<any>(null);
  const roomSubscriptionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<any>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (room) {
      inactivityTimeoutRef.current = setTimeout(() => {
        leaveRoom();
      }, INACTIVITY_TIMEOUT);
    }
  }, [room, leaveRoom]);

  /**
   * Enter the matching queue - wait for a partner
   */
  const startMatching = useCallback(async (nickname: string) => {
    setIsSearching(true);
    setError(null);

    try {
      // Try to find an existing waiting room
      const { data: existingRooms, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .limit(1);

      if (roomError) throw roomError;

      let matchedRoom: ChatRoom;

      if (existingRooms && existingRooms.length > 0) {
        // Found a waiting room - join it as user_b
        const roomToJoin = existingRooms[0];
        const otherUserSession = roomToJoin.user_a;

        const { data: updatedRoom, error: updateError } = await supabase
          .from('rooms')
          .update({
            status: 'active',
            user_b: sessionId,
          })
          .eq('id', roomToJoin.id)
          .select()
          .single();

        if (updateError) throw updateError;
        matchedRoom = updatedRoom;
        setPartnerSession(otherUserSession);
      } else {
        // No waiting room - create one and wait
        const { data: newRoom, error: createError } = await supabase
          .from('rooms')
          .insert({
            user_a: sessionId,
            status: 'waiting',
          })
          .select()
          .single();

        if (createError) throw createError;
        matchedRoom = newRoom;

        // Wait for a match via realtime subscription
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('No match found within 60 seconds'));
          }, 60000);

          channelRef.current = supabase
            .channel(`room-${newRoom.id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${newRoom.id}`,
              },
              (payload) => {
                if (payload.new.status === 'active' && payload.new.user_b && payload.new.user_b !== sessionId) {
                  clearTimeout(timeout);
                  setPartnerSession(payload.new.user_b);
                  resolve();
                }
              }
            )
            .subscribe();
        });
      }

      setRoom(matchedRoom);

      // Fetch partner nickname
      const { data: partnerData } = await supabase
        .from('sessions')
        .select('nickname')
        .eq('id', matchedRoom.user_a === sessionId ? matchedRoom.user_b : matchedRoom.user_a)
        .single();

      setPartnerNick(partnerData?.nickname || 'Stranger');

      // Start listening for messages
      subscribeToRoom(matchedRoom.id);

      setIsSearching(false);
    } catch (err: any) {
      setError(err.message);
      setIsSearching(false);
    }
  }, [sessionId]);

  /**
   * Cancel matching
   */
  const cancelMatching = useCallback(async () => {
    setIsSearching(false);

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clean up any orphaned waiting room
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('user_a', sessionId)
      .eq('status', 'waiting');

    if (rooms && rooms.length > 0) {
      await supabase.from('rooms').delete().eq('id', rooms[0].id);
    }
  }, [sessionId]);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(async () => {
    if (!room) return;

    await supabase.from('rooms').update({ status: 'ended' }).eq('id', room.id);

    if (roomSubscriptionRef.current) {
      roomSubscriptionRef.current.unsubscribe();
      roomSubscriptionRef.current = null;
    }

    setRoom(null);
    setPartnerSession(null);
    setPartnerNick(null);
    setMessages([]);
    setIsPartnerTyping(false);
  }, [room]);

  /**
   * Subscribe to realtime messages for this room
   */
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      roomSubscriptionRef.current = supabase
        .channel(`room-messages-${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const msg = payload.new as ChatMessage;
            // Add all messages (both from self and partner)
            setMessages(prev => [...prev, msg]);
            // Reset inactivity timer on received message
            if (msg.sender_session_id !== sessionId) {
              resetInactivityTimer();
            }
          }
        )
        .subscribe();
    },
    [sessionId]
  );

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!room) return;

      const { error } = await supabase.from('messages').insert({
        room_id: room.id,
        sender_session_id: sessionId,
        nickname: '', // Can be denormalized or fetched from sessions table
        content,
        image_url: imageUrl,
      });

      if (error) {
        console.error('Failed to send message:', error);
        return;
      }

      // Reset inactivity timer on sent message
      resetInactivityTimer();

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      broadcastTyping(false);
    },
    [room, sessionId, resetInactivityTimer]
  );

  /**
   * Mark typing status (debounced)
   */
  const markTyping = useCallback(
    (isTyping: boolean) => {
      if (!room) return;

      // Send typing event via broadcast
      supabase
        .channel(`typing-${room.id}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            room_id: room.id,
            session_id: sessionId,
            is_typing: isTyping,
          },
        });

      // Debounce - auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          broadcastTyping(false);
        }, 3000);
      }
    },
    [room, sessionId]
  );

  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      if (!room) return;
      supabase
        .channel(`typing-${room.id}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            room_id: room.id,
            session_id: sessionId,
            is_typing,
          },
        });
    },
    [room, sessionId]
  );

  /**
   * Report partner
   */
  const reportPartner = useCallback(
    async (reason: string) => {
      if (!room || !partnerSession) return;

      await supabase.from('reports').insert({
        reporter_session: sessionId,
        reported_session: partnerSession,
        room_id: room.id,
        reason,
      });

      leaveRoom();
    },
    [room, sessionId, partnerSession, leaveRoom]
  );

  // Set up typing indicator listener
  useEffect(() => {
    if (!room) return;

    const channel = supabase.channel(`typing-${room.id}`);

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.session_id !== sessionId) {
          setIsPartnerTyping(payload.payload.is_typing);
        }
      })
      .subscribe();

    typingChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [room, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (roomSubscriptionRef.current) {
        roomSubscriptionRef.current.unsubscribe();
      }
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe();
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSearching,
    room,
    partnerSession,
    partnerNick,
    messages,
    error,
    startMatching,
    cancelMatching,
    leaveRoom,
    sendMessage,
    markTyping,
    isPartnerTyping,
    reportPartner,
  };
}
