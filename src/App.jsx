import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Hero from "./components/Landing/Hero";
import InterestsGrid from "./components/Landing/InterestsGrid";
import IdentityStep from "./components/Onboarding/IdentityStep";
import SearchingRadar from "./components/Chat/SearchingRadar";
import ChatInterface from "./components/Chat/ChatInterface";
import { HUDCard, CyberButton, GlowButton } from "./components/UI/DesignSystem";

import useStranger from "./hooks/useStranger";
import { X, ArrowLeft } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [setupStep, setSetupStep] = useState("gender");
  const [profile, setProfile] = useState({ gender: "", age: "", interests: [] });
  const [inputText, setInputText] = useState("");
  
  const strangerAI = useStranger();

  const handleGetStarted = () => {
    setScreen("identity");
  };

  const handleIdentityComplete = (gender, age) => {
    setProfile(prev => ({ ...prev, gender, age }));
    setScreen("onboarding");
  };

  const handleStartMatching = () => {
    if (!profile.gender || !profile.age) return;
    setScreen("searching");
    
    setTimeout(() => {
      strangerAI.initialize([profile.gender, profile.age]);
      setScreen("chat");
      
      setTimeout(() => {
        strangerAI.generateResponse("Hey there! 👋");
      }, 1500);
    }, 4000);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    
    strangerAI.setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setInputText("");
    strangerAI.generateResponse(text);
  };

  const handleSkip = () => {
    setScreen("searching");
    handleStartMatching();
  };

  const toggleInterest = (id) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      <div className="mesh-shader" />

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div 
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Hero onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {screen === "identity" && (
          <motion.div 
            key="identity"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <IdentityStep 
              step={setupStep}
              setStep={setSetupStep}
              profile={profile}
              setProfile={updateProfile}
              onStart={() => handleIdentityComplete(profile.gender, profile.age)}
            />
          </motion.div>
        )}

        {screen === "onboarding" && (
          <motion.div 
            key="onboarding"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-screen"
          >
            <div className="max-w-2xl mx-auto p-4 pt-8">
              <motion.button 
                onClick={() => {
                  setScreen("identity");
                  setSetupStep("gender");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 mb-6 transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              >
                <ArrowLeft size={18} /> Back
              </motion.button>

              <HUDCard className="text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Select Your Interests</h1>
                  <p className="text-white/40 text-sm">Choose up to 5 interests to find better matches</p>
                </div>

                <InterestsGrid 
                  selectedInterests={profile.interests}
                  onToggle={toggleInterest}
                />

                <div className="flex justify-center gap-2 flex-wrap">
                  {profile.interests.slice(0, 5).map(id => (
                    <span 
                      key={id} 
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(0, 245, 255, 0.15)',
                        color: '#00f5ff'
                      }}
                    >
                      {id}
                    </span>
                  ))}
                </div>

                <GlowButton 
                  onClick={handleStartMatching} 
                  className="w-full h-14 text-base"
                  disabled={profile.interests.length === 0}
                  glow
                >
                  Start Chatting
                </GlowButton>
              </HUDCard>
            </div>
          </motion.div>
        )}

        {screen === "searching" && (
          <motion.div 
            key="searching"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SearchingRadar 
              profile={profile} 
              onFindMatch={handleStartMatching}
            />
          </motion.div>
        )}

        {screen === "chat" && (
          <motion.div 
            key="chat"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="h-screen"
          >
            <ChatInterface 
              messages={strangerAI.messages}
              inputText={inputText}
              setInputText={setInputText}
              onSend={handleSend}
              onSkip={handleSkip}
              onEnd={() => setScreen("ended")}
              isTyping={strangerAI.isTyping}
              mood={strangerAI.mood}
              strength={strangerAI.connectionStrength}
              onSendGift={() => {}}
            />
          </motion.div>
        )}

        {screen === "ended" && (
          <motion.div 
            key="ended"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-screen flex items-center justify-center p-4"
          >
              <HUDCard className="max-w-sm w-full text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 45, 85, 0.1)',
                      border: '1px solid rgba(255, 45, 85, 0.2)'
                    }}
                  >
                      <X className="text-error-rose" size={32} />
                  </motion.div>
                  
                  <div className="space-y-2 mb-8">
                    <h2 className="text-xl font-bold text-white">Chat Ended</h2>
                    <p className="text-white/40 text-sm">The stranger has disconnected</p>
                  </div>

                  <div className="flex gap-3">
                    <CyberButton variant="secondary" onClick={() => setScreen("landing")} className="flex-1">
                      Home
                    </CyberButton>
                    <GlowButton onClick={handleStartMatching} className="flex-1">
                      Find Another
                    </GlowButton>
                  </div>
              </HUDCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}