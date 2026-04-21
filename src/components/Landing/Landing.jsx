import React, { useState } from 'react';
import { Users, Shield, MessageCircle, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { validateNickname } from '../../hooks/useSession';

/**
 * Landing Screen - Clean Modern Design
 */
export default function Landing({ onStart }) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setLoading(true);
    setError('');
    onStart(nickname.trim());
  };

  return (
    <div className="screen landing fade-in">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div style={{ marginBottom: 48 }}>
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: 100,
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--accent-hover)'
        }}>
          <Sparkles size={16} />
          <span>Anonymous Chat</span>
        </div>
        
        <div style={{ 
          width: 80, 
          height: 80, 
          margin: '0 auto 24px',
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)'
        }}>
          <Zap size={40} color="white" />
        </div>
        
        <h1 className="landing-title">Stranger Chat</h1>
        <p className="landing-subtitle">
          Connect instantly with random strangers worldwide.<br />
          No accounts. No limits. Just conversation.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360 }}>
        <div className="nickname-input-wrapper">
          <input
            type="text"
            className="input"
            placeholder="Choose a nickname"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError('');
            }}
            maxLength={20}
            autoFocus
            style={{ 
              textAlign: 'center',
              fontSize: 18,
              padding: '16px 20px'
            }}
          />
          {error && (
            <p className="error-text">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !nickname.trim()}
          style={{ 
            width: '100%', 
            padding: '16px 24px',
            fontSize: 16,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <>
              <span>Connecting</span>
              <span style={{ animation: 'pulse 1s infinite' }}>...</span>
            </>
          ) : (
            <>
              Start Chatting
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="online-count">
        <span className="online-dot" />
        <span>2,847 strangers online now</span>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 32, 
        marginTop: 48, 
        color: 'var(--text-muted)',
        fontSize: 13 
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={14} /> Anonymous
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageCircle size={14} /> Free
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} /> Random
        </span>
      </div>
    </div>
  );
}