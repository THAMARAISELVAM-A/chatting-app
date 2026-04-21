import { useState, useCallback, useRef } from 'react';

const MOODS = {
  FRIENDLY: {
    speed: 0.8,
    typoChance: 0.1,
    vocabulary: ['hey', 'lol', 'awesome', 'cool!', 'yay', ':)'],
    openers: [
      "Hey! I saw we both matched on [INTEREST]. That's awesome!",
      "Hi there! Glad I found a fellow [INTEREST] enthusiast.",
      "Hello! How's your day going? I was just reading about [INTEREST]."
    ],
    responses: ['that sounds so cool!', 'oh wow, really?', 'haha i love that', 'tell me more!']
  },
  MYSTERIOUS: {
    speed: 2.0,
    typoChance: 0.02,
    vocabulary: ['void', 'signal', 'echo', 'shadow', 'pulse'],
    openers: [
      "The signal led me here. Do you really know much about [INTEREST]?",
      "Shadows everywhere... yet we find ourselves in the [INTEREST] node.",
      "A rare connection. I've been monitoring the [INTEREST] signals for a while."
    ],
    responses: ['the data never lies.', 'everything is an echo.', 'silence speaks louder.', 'do you feel it?']
  },
  SKEPTICAL: {
    speed: 1.5,
    typoChance: 0.05,
    vocabulary: ['uh', 'ok', '?', 'maybe', 'why', 'who'],
    openers: [
      "Another node... [INTEREST], really? Hope you're not a bot.",
      "Connecting... let's see if this [INTEREST] match is actually real.",
      "Just another ghost in the machine. Why [INTEREST]?"
    ],
    responses: ['why should I tell you?', 'i guess.', 'not sure if i believe that', 'k.']
  },
  CYBER_NETIC: {
    speed: 1.2,
    typoChance: 0.01,
    vocabulary: ['protocol', 'mainframe', 'uplink', 'sequence', 'override'],
    openers: ['Uplink established. Protocol 7 active.', 'Scanning for compatible nodes...', 'Interface ready. State your query.'],
    responses: ['Input analyzed. Processing...', 'Result: highly improbable but fascinating.', 'Memory buffers cleared. Proceed.', 'Interesting variable detected.']
  }
};

const TYPOS = {
  'the': 'teh',
  'to': 'ot',
  'you': 'u',
  'are': 'r',
  'that': 'taht',
  'what': 'waht',
  'with': 'wih'
};

export default function useStranger() {
  const [mood, setMood] = useState('FRIENDLY');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [connectionStrength, setConnectionStrength] = useState(100);
  const [name, setName] = useState('Stranger');
  
  const historyRef = useRef([]);
  const moodRef = useRef('FRIENDLY');

  const initialize = useCallback((interests = [], strangerName = 'Stranger') => {
    const keys = Object.keys(MOODS);
    const randomMood = keys[Math.floor(Math.random() * keys.length)];
    setMood(randomMood);
    moodRef.current = randomMood;
    setConnectionStrength(100);
    setMessages([]);
    setName(strangerName);
    historyRef.current = [];
    
    return { mood: randomMood, name: strangerName };
  }, []);

  const generateResponse = useCallback(async (userText) => {
    const currentMood = MOODS[moodRef.current];
    setIsTyping(true);

    // Calculate latency based on mood and text length
    const baseDelay = (userText?.length || 20).toString().length * 200 * currentMood.speed;
    const jitter = Math.random() * 1000 + 1000;
    await new Promise(r => setTimeout(r, baseDelay + jitter));

    let responseText = '';
    
    // Simple contextual checking
    const input = userText.toLowerCase();
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
        responseText = currentMood.openers[Math.floor(Math.random() * currentMood.openers.length)];
        // Replace interest placeholder if present
        const interest = historyRef.current.length === 0 ? 'our shared node' : 'this connection'; 
        responseText = responseText.replace('[INTEREST]', interest);
    } else if (input.includes('who') || input.includes('name')) {
        responseText = `I'm ${name}. A phantom in the protocol.`;
    } else {
        responseText = currentMood.responses[Math.floor(Math.random() * currentMood.responses.length)];
    }

    // Add simulated typo?
    let typoMessage = null;
    if (Math.random() < currentMood.typoChance) {
      const words = responseText.toLowerCase().split(' ');
      for (let i = 0; i < words.length; i++) {
        if (TYPOS[words[i]]) {
          const original = words[i];
          words[i] = TYPOS[words[i]];
          typoMessage = responseText.replace(original, words[i]);
          break;
        }
      }
    }

    setIsTyping(false);

    if (typoMessage) {
      // Send typo, then correction
      const tMsg = { id: Date.now(), sender: 'stranger', text: typoMessage, time: getTime() };
      addMessage(tMsg);
      
      await new Promise(r => setTimeout(r, 1200));
      const cMsg = { id: Date.now() + 1, sender: 'stranger', text: `*${responseText}`, time: getTime() };
      addMessage(cMsg);
    } else {
      const msg = { id: Date.now(), sender: 'stranger', text: responseText, time: getTime() };
      addMessage(msg);
    }

    // Update connection strength randomly
    setConnectionStrength(prev => Math.max(15, prev - Math.floor(Math.random() * 3)));
  }, [name]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
    historyRef.current.push(msg);
  };

  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return { mood, messages, isTyping, connectionStrength, initialize, generateResponse, setMessages, name };
}
