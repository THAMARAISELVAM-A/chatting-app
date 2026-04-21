import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Matching hook - handles queue, pairing, and messaging
 */
export default function useMatching(sessionId) {
  const [isSearching, setIsSearching] = useState(false);
  const [room, setRoom] = useState(null);
  const [partnerSession, setPartnerSession] = useState(null);
  const [partnerNick, setPartnerNick] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const channelRef = useRef(null);
  const msgSubRef = useRef(null);
  const typingRef = useRef(null);
  const inactivityRef = useRef(null);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback((currentRoom, onLeave) => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    if (currentRoom) {
      inactivityRef.current = setTimeout(() => {
        if (onLeave) onLeave();
      }, INACTIVITY_TIMEOUT);
    }
  }, []);

  // Clean up function
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (msgSubRef.current) {
      msgSubRef.current.unsubscribe();
      msgSubRef.current = null;
    }
    if (typingRef.current) {
      typingRef.current.unsubscribe();
      typingRef.current = null;
    }
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = null;
    }
  }, []);

  // Start matching
  const startMatching = useCallback(async (nickname) => {
    if (!supabase || !sessionId) {
      // Demo mode - simulate matching after delay
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setRoom({ id: 'demo-room' });
        setPartnerSession('demo-partner');
        setPartnerNick('Alice');
        setMessages([]);
      }, 3000);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Save session to database
      await supabase.from('sessions').upsert({
        id: sessionId,
        nickname,
        last_active: new Date().toISOString()
      });

      // Try to find existing waiting room
      const { data: waitingRooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .neq('user_a', sessionId)
        .limit(1);

      let matchedRoom;

      if (waitingRooms?.length > 0) {
        // Join existing room
        const roomToJoin = waitingRooms[0];
        const { data: updated } = await supabase
          .from('rooms')
          .update({ status: 'active', user_b: sessionId })
          .eq('id', roomToJoin.id)
          .select()
          .single();
        
        matchedRoom = updated;
        setPartnerSession(roomToJoin.user_a);
      } else {
        // Create new waiting room
        const { data: newRoom } = await supabase
          .from('rooms')
          .insert({ user_a: sessionId, status: 'waiting' })
          .select()
          .single();
        
        matchedRoom = newRoom;

        // Subscribe to room changes
        channelRef.current = supabase
          .channel(`room-${newRoom.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${newRoom.id}`
          }, async (payload) => {
            if (payload.new.status === 'active' && payload.new.user_b) {
              setPartnerSession(payload.new.user_b);
              
              // Get partner nickname
              const { data: partnerData } = await supabase
                .from('sessions')
                .select('nickname')
                .eq('id', payload.new.user_b)
                .single();
              
              setPartnerNick(partnerData?.nickname || 'Stranger');
            }
          })
          .subscribe();
        
        // Wait for match (timeout 60s)
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('No match found'));
          }, 60000);

          const checkInterval = setInterval(async () => {
            const { data } = await supabase
              .from('rooms')
              .select('status, user_b')
              .eq('id', newRoom.id)
              .single();
            
            if (data?.status === 'active' && data?.user_b) {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              setPartnerSession(data.user_b);
              resolve();
            }
          }, 1000);
        });
      }

      setRoom(matchedRoom);
      setIsSearching(false);

      // Get partner nickname
      const partnerId = matchedRoom.user_a === sessionId ? matchedRoom.user_b : matchedRoom.user_a;
      const { data: partnerData } = await supabase
        .from('sessions')
        .select('nickname')
        .eq('id', partnerId)
        .single();
      
      setPartnerNick(partnerData?.nickname || 'Stranger');
      setPartnerSession(partnerId);

      // Subscribe to messages
      subscribeToMessages(matchedRoom.id);

    } catch (err) {
      setError(err.message || 'Matching failed');
      setIsSearching(false);
      cleanup();
    }
  }, [sessionId, cleanup]);

  // Subscribe to messages
  const subscribeToMessages = useCallback((roomId) => {
    if (!supabase) return;

    msgSubRef.current = supabase
      .channel(`messages-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        const msg = payload.new;
        setMessages(prev => [...prev, msg]);
        
        // Reset inactivity timer
        if (msg.sender_session_id !== sessionId) {
          resetInactivityTimer(room, leaveRoom);
        }
      })
      .subscribe();

    // Typing indicator
    typingRef.current = supabase
      .channel(`typing-${roomId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.session_id !== sessionId) {
          setIsPartnerTyping(payload.payload.is_typing);
          // Auto-stop typing after 5s
          setTimeout(() => setIsPartnerTyping(false), 5000);
        }
      })
      .subscribe();

    // Load existing messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };
    loadMessages();
  }, [sessionId, room, resetInactivityTimer]);

  // Cancel matching
  const cancelMatching = useCallback(async () => {
    setIsSearching(false);
    cleanup();

    if (supabase && sessionId) {
      // Delete waiting room
      await supabase
        .from('rooms')
        .delete()
        .eq('user_a', sessionId)
        .eq('status', 'waiting');
    }
  }, [sessionId, cleanup]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!room) return;

    if (supabase) {
      await supabase
        .from('rooms')
        .update({ status: 'ended' })
        .eq('id', room.id);
    }

    cleanup();
    setRoom(null);
    setPartnerSession(null);
    setPartnerNick(null);
    setMessages([]);
    setIsPartnerTyping(false);
  }, [room, cleanup]);

  // Send message
  const sendMessage = useCallback(async (content, imageUrl) => {
    if (!room || !content.trim()) return;

    const msg = {
      room_id: room.id,
      sender_session_id: sessionId,
      content: content.trim(),
      image_url: imageUrl || null
    };

    if (supabase) {
      await supabase.from('messages').insert(msg);
    } else {
      // Demo mode
      setMessages(prev => [...prev, { ...msg, id: `msg_${Date.now()}`, created_at: new Date().toISOString() }]);
    }

    resetInactivityTimer(room, leaveRoom);
  }, [room, sessionId, leaveRoom, resetInactivityTimer]);

  // Typing indicator
  const markTyping = useCallback((isTyping) => {
    if (!supabase || !room) return;
    
    supabase
      .channel(`typing-${room.id}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { room_id: room.id, session_id: sessionId, is_typing: isTyping }
      });
  }, [room, sessionId]);

  // Report
  const reportPartner = useCallback(async (reason) => {
    if (!supabase || !room || !partnerSession) return;

    await supabase.from('reports').insert({
      reporter_session: sessionId,
      reported_session: partnerSession,
      room_id: room.id,
      reason
    });

    leaveRoom();
  }, [room, sessionId, partnerSession, leaveRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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
    reportPartner
  };
}