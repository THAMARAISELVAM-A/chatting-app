import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Matching Screen - Animated Orb Design
 */
export default function Matching({ nickname, onCancel, onMatched }) {
  const [count, setCount] = useState(0);

  // Counter for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen matching fade-in">
      <div className="matching-orb">
        <div className="orb-core" />
        <div className="orb-ring" />
        <div className="orb-ring" />
      </div>

      <h2 className="matching-text">Finding a stranger...</h2>
      <p className="matching-subtext">
        Connecting you with someone cool
      </p>

      <button className="btn btn-secondary" onClick={onCancel}>
        <X size={18} />
        Cancel
      </button>
    </div>
  );
}