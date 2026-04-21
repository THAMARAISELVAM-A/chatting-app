import { useEffect, useState, useCallback } from 'react';
import Landing from '@/components/Landing/Landing';
import Matching from '@/components/Matching/Matching';
import Chat from '@/components/Chat/Chat';
import useSession from '@/hooks/useSession';
import useMatching from '@/hooks/useMatching';

type Stage =
  | { kind: 'landing' }
  | { kind: 'matching'; nickname: string }
  | {
      kind: 'chat';
      nickname: string;
      roomId: string;
      mySessionId: string;
      partnerSession: string;
      partnerNick: string;
    };

export default function Index() {
  const [stage, setStage] = useState<Stage>({ kind: 'landing' });
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
    error,
  } = useMatching(session?.id || '');

  useEffect(() => {
    document.title = 'Whisper — Anonymous chat with strangers';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Anonymous 1-on-1 chat with random strangers. No account required. Pick a nickname and start talking.'
      );
    }
  }, []);

  const handleStart = useCallback(
    (nickname: string) => {
      setNickname(nickname);
      setStage({ kind: 'matching', nickname });
    },
    [setNickname]
  );

  const handleMatched = useCallback(
    (roomId: string, partnerSessionId: string, partnerNickname: string) => {
      setStage({
        kind: 'chat',
        nickname: stage.nickname,
        roomId,
        mySessionId: session!.id,
        partnerSession: partnerSessionId,
        partnerNick: partnerNickname,
      });
    },
    [stage.nickname, session]
  );

  const handleSkip = useCallback(() => {
    setStage({ kind: 'matching', nickname: stage.nickname });
  }, [stage.nickname]);

  const handleLeave = useCallback(() => {
    setStage({ kind: 'landing' });
  }, []);

  // Show loading while session initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (stage.kind === 'landing') {
    return <Landing onStart={handleStart} />;
  }

  if (stage.kind === 'matching') {
    return (
      <Matching
        nickname={stage.nickname}
        onCancel={() => setStage({ kind: 'landing' })}
        onMatched={handleMatched}
      />
    );
  }

  // chat stage
  return (
    <Chat
      roomId={stage.roomId}
      mySessionId={stage.mySessionId}
      partnerSession={stage.partnerSession}
      partnerNick={stage.partnerNick}
      myNickname={stage.nickname}
      onSkip={handleSkip}
      onLeave={handleLeave}
    />
  );
}
