import React, { useState, useEffect, useCallback } from 'react';
import Landing from './components/Landing/Landing';
import Matching from './components/Matching/Matching';
import Chat from './components/Chat/Chat';
import useSession from './hooks/useSession';
import useMatching from './hooks/useMatching';
import './index.css';

export default function App() {
  const [stage, setStage] = useState('landing'); // landing | matching | chat
  const { session, isLoaded, setNickname } = useSession();
  const {
    isSearching,
    startMatching,
    cancelMatching,
    leaveRoom,
    room,
    partnerSession,
    partnerNick,
    messages,
    sendMessage,
    markTyping,
    isPartnerTyping,
    reportPartner
  } = useMatching(session?.id || '');

  const handleStart = useCallback(async (nickname) => {
    setNickname(nickname);
    setStage('matching');
    await startMatching(nickname);
  }, [setNickname, startMatching]);

  const handleMatched = useCallback(() => {
    if (room && partnerSession) {
      setStage('chat');
    }
  }, [room, partnerSession]);

  // Auto-transition to chat when matched
  useEffect(() => {
    if (stage === 'matching' && room && partnerSession && !isSearching) {
      handleMatched();
    }
  }, [room, partnerSession, isSearching, stage, handleMatched]);

  const handleCancel = useCallback(async () => {
    await cancelMatching();
    setStage('landing');
  }, [cancelMatching]);

  const handleSkip = useCallback(async () => {
    await leaveRoom();
    setStage('matching');
    if (session?.nickname) {
      await startMatching(session.nickname);
    }
  }, [leaveRoom, startMatching, session]);

  const handleLeave = useCallback(async () => {
    await leaveRoom();
    setStage('landing');
  }, [leaveRoom]);

  const handleSendMessage = useCallback(async (content) => {
    await sendMessage(content);
  }, [sendMessage]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="app-container">
        <div className="screen">
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {stage === 'landing' && (
        <Landing onStart={handleStart} />
      )}

      {stage === 'matching' && (
        <Matching 
          nickname={session?.nickname || ''}
          onCancel={handleCancel}
          onMatched={handleMatched}
        />
      )}

      {stage === 'chat' && (
        <Chat
          roomId={room?.id}
          mySessionId={session?.id}
          partnerSession={partnerSession}
          partnerNick={partnerNick || 'Stranger'}
          myNickname={session?.nickname || ''}
          onSkip={handleSkip}
          onLeave={handleLeave}
          onReport={reportPartner}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={markTyping}
          isPartnerTyping={isPartnerTyping}
        />
      )}
    </div>
  );
}