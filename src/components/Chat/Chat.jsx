import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Smile, 
  Send, 
  SkipForward, 
  LogOut, 
  MoreVertical,
  Image,
  AlertTriangle,
  Shield,
  X
} from 'lucide-react';

/**
 * Chat Screen - Clean Modern Design
 */
export default function Chat({ 
  roomId, 
  mySessionId, 
  partnerSession, 
  partnerNick = 'Stranger',
  myNickname, 
  onSkip, 
  onLeave,
  onReport,
  messages = [],
  onSendMessage,
  onTyping,
  isPartnerTyping = false
}) {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    onTyping?.(false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    // Send typing indicator
    onTyping?.(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReport = () => {
    if (reportReason && onReport) {
      onReport(reportReason);
      setShowReport(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const myInitial = myNickname?.charAt(0).toUpperCase() || 'Y';
  const partnerInitial = partnerNick?.charAt(0).toUpperCase() || 'S';

  return (
    <div className="chat-container fade-in">
      {/* Header */}
      <div className="chat-header glass">
        <div className="chat-header-left">
          <div className="chat-avatar">{partnerInitial}</div>
          <div className="chat-header-info">
            <h3>{partnerNick}</h3>
            <span>Online</span>
          </div>
        </div>
        
        <div className="menu-container">
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="menu-dropdown" onClick={() => setShowMenu(false)}>
              <div className="menu-item" onClick={onSkip}>
                <SkipForward size={16} />
                Skip to next
              </div>
              <div className="menu-item" onClick={onLeave} style={{ color: 'var(--error)' }}>
                <LogOut size={16} />
                Leave chat
              </div>
              <div className="menu-item" onClick={() => setShowReport(true)} style={{ color: 'var(--error)' }}>
                <Shield size={16} />
                Report
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages custom-scrollbar">
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)',
            padding: '40px 0'
          }}>
            <p>Say hi to {partnerNick}! 👋</p>
          </div>
        )}
        
        {messages.map((msg, i) => {
          const isMine = msg.sender_session_id === mySessionId;
          return (
            <div 
              key={msg.id || i} 
              className={`message ${isMine ? 'message-sent' : 'message-received'}`}
            >
              <p>{msg.content}</p>
              {msg.created_at && (
                <span className="message-time">{formatTime(msg.created_at)}</span>
              )}
            </div>
          );
        })}
        
        {isPartnerTyping && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <button className="btn btn-ghost btn-icon">
          <Paperclip size={20} />
        </button>
        
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        
        <button className="btn btn-ghost btn-icon">
          <Smile size={20} />
        </button>
        
        <button 
          className="btn btn-primary btn-icon"
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowReport(false)}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: 24,
            borderRadius: 16,
            maxWidth: 400,
            width: '90%',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Report {partnerNick}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowReport(false)}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
              Why are you reporting this user?
            </p>
            
            <select
              className="input"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <option value="">Select a reason</option>
              <option value="inappropriate">Inappropriate behavior</option>
              <option value="harassment">Harassment</option>
              <option value="spam">Spam</option>
              <option value="other">Other</option>
            </select>
            
            <button
              className="btn btn-primary"
              onClick={handleReport}
              disabled={!reportReason}
              style={{ width: '100%' }}
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}