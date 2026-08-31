import React, { useState } from 'react';
import { UserDetails } from '../types/chat';
import { CryptoService } from '../services/crypto';
import { Lock } from 'lucide-react';

interface MessageItemProps {
  message: UserDetails;
  currentUser: string;
}

const EMOJI_LIST = ['👍', '❤️', '🔥', '😂', '🎉'];

export const MessageItem: React.FC<MessageItemProps> = ({ message, currentUser }) => {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isMe = message.user === currentUser;
  const isSystem = message.user_type === 'System';

  const handleToggleReaction = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    setShowEmojiPicker(false);
  };

  if (isSystem) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '18px 0',
        }}
      >
        <span
          style={{
            fontSize: '0.76rem',
            fontWeight: 500,
            padding: '4px 14px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            letterSpacing: '0.01em',
          }}
        >
          {message.message}
        </span>
      </div>
    );
  }

  const channelKey = CryptoService.getChannelKey(message.roomId || '', currentUser, message.recipient);
  const decryptedText = CryptoService.decryptText(message.message, channelKey);
  const isEncrypted = message.message.startsWith('[ENC:AES-256]');

  return (
    <div
      className="animate-float-in"
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 18,
        position: 'relative',
      }}
      onMouseLeave={() => setShowEmojiPicker(false)}
    >
      <img
        src={message.user_profile || 'images/user1.jpg'}
        alt={message.user}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          objectFit: 'cover',
          border: isMe ? '2px solid var(--primary)' : '2px solid var(--accent)',
          boxShadow: isMe ? '0 4px 12px rgba(147, 51, 234, 0.35)' : '0 4px 12px rgba(192, 132, 252, 0.35)',
        }}
      />

      <div
        style={{
          maxWidth: '68%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMe ? 'flex-end' : 'flex-start',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {message.user}
          </span>
          {isEncrypted && (
            <span title="AES-256 End-to-End Encrypted" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Lock style={{ width: 11, height: 11, color: '#22c55e' }} />
            </span>
          )}
          <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>
            {message.timestamp}
          </span>
        </div>

        <div
          style={{
            padding: '12px 18px',
            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: isMe
              ? 'linear-gradient(135deg, #9333ea, #a855f7)'
              : 'rgba(30, 41, 59, 0.75)',
            color: '#fff',
            fontSize: '0.94rem',
            lineHeight: 1.45,
            wordBreak: 'break-word',
            boxShadow: isMe
              ? '0 6px 20px rgba(147, 51, 234, 0.35)'
              : '0 4px 14px rgba(0, 0, 0, 0.25)',
            border: isMe ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--border-color)',
            position: 'relative',
          }}
          onMouseEnter={() => setShowEmojiPicker(true)}
        >
          {decryptedText}

          {/* Quick Reaction Bar Trigger */}
          {showEmojiPicker && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: -36,
                [isMe ? 'right' : 'left']: 0,
                padding: '3px 8px',
                borderRadius: 20,
                display: 'flex',
                gap: 6,
                zIndex: 20,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              {EMOJI_LIST.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleToggleReaction(emoji)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    padding: 2,
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Displayed Emoji Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {Object.entries(reactions).map(([emoji, count], i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{emoji}</span>
                <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
