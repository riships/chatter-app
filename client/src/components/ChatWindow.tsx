import React, { useState, useRef, useEffect } from 'react';
import { UserDetails, ActiveChat, RoomData, UserAccount } from '../types/chat';
import { soundService } from '../services/sound';
import { MessageItem } from './MessageItem';
import { ThemePicker } from './ThemePicker';
import { Send, Menu, MessageSquare, Sparkles, UserPlus, LogOut, Trash2, Info, ShieldCheck } from 'lucide-react';

interface ChatWindowProps {
  currentUser: string;
  currentRoom: string;
  roomDetails?: RoomData | null;
  allUsers: UserAccount[];
  avatarUrl: string;
  activeChat: ActiveChat;
  messages: UserDetails[];
  typingStatus: string | null;
  onSendMessage: (msg: string) => void;
  onTyping: (text: string) => void;
  onToggleSidebar: () => void;
  onLeaveGroupRoom: (roomId: string) => void;
  onDeleteGroupRoom: (roomId: string) => void;
  onOpenGroupInfo: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  currentRoom,
  roomDetails,
  allUsers,
  avatarUrl,
  activeChat,
  messages,
  typingStatus,
  onSendMessage,
  onTyping,
  onToggleSidebar,
  onLeaveGroupRoom,
  onDeleteGroupRoom,
  onOpenGroupInfo,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isNone = activeChat.mode === 'none';
  const isDirect = activeChat.mode === 'direct';
  const isRoom = activeChat.mode === 'room';
  const isOwner = isRoom && roomDetails?.createdBy === currentUser;

  // Look up target recipient details for 1-on-1 chats
  const targetUserAccount = isDirect
    ? allUsers.find((u) => u.username === activeChat.target)
    : null;

  const displayTitle = isNone
    ? 'Welcome to Chatter'
    : isDirect
    ? activeChat.target
    : roomDetails?.name || currentRoom;

  const displayAvatar = isDirect
    ? targetUserAccount?.userProfile || 'images/user1.jpg'
    : avatarUrl;

  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    return `Last seen ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const displayStatusText = isNone
    ? 'Logged in as ' + currentUser
    : isDirect
    ? targetUserAccount?.isOnline
      ? '● Online'
      : formatLastSeen(targetUserAccount?.lastSeen)
    : `${roomDetails?.members?.length || 1} members`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    onTyping(val ? 'Typing...' : '');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping('');
    }, 1000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isNone) {
      soundService.playSendPop();
      onSendMessage(inputText.trim());
      setInputText('');
      onTyping('');
    }
  };

  return (
    <main
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'rgba(15, 23, 42, 0.4)',
      }}
    >
      {/* Top Header */}
      <header
        className="glass-panel"
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="spring-btn"
            onClick={onToggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Menu style={{ width: 22, height: 22 }} />
          </button>

          {!isNone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={displayAvatar}
                  alt={displayTitle}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.35)',
                  }}
                />
                {isDirect && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: targetUserAccount?.isOnline ? '#22c55e' : '#94a3b8',
                      border: '2px solid #0f172a',
                    }}
                  />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                    {displayTitle}
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      fontWeight: 600,
                    }}
                  >
                    <ShieldCheck style={{ width: 12, height: 12 }} />
                    <span>AES-256 Encrypted</span>
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.76rem',
                    color: isDirect && targetUserAccount?.isOnline ? '#22c55e' : 'var(--text-muted)',
                    fontWeight: 500,
                  }}
                >
                  {displayStatusText}
                </span>
              </div>
            </div>
          )}

          {isNone && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {displayTitle}
              </h3>
              <span style={{ fontSize: '0.76rem', color: '#22c55e', fontWeight: 500 }}>
                {displayStatusText}
              </span>
            </div>
          )}
        </div>

        {/* Header Actions (Theme Picker, Group Info, Leave, Delete) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemePicker />

          {isRoom && (
            <>
              <button
                className="spring-btn"
                onClick={onOpenGroupInfo}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--accent)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Info style={{ width: 15, height: 15 }} />
                <span>Group Info</span>
              </button>

              <button
                className="spring-btn"
                onClick={() => onLeaveGroupRoom(currentRoom)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <LogOut style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                <span>Leave</span>
              </button>

              {isOwner && (
                <button
                  className="spring-btn"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete room '${currentRoom}' for all members?`)) {
                      onDeleteGroupRoom(currentRoom);
                    }
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Message Stream or Discovery Welcome View */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
        }}
      >
        {isNone ? (
          <div
            className="animate-float-in"
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 16,
              maxWidth: 460,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.45)',
              }}
            >
              <Sparkles style={{ width: 38, height: 38, color: '#fff' }} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800 }}>
              Welcome back, {currentUser}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6 }}>
              Select a contact from your direct directory to launch an end-to-end encrypted thread, or jump into a group channel.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                className="spring-btn"
                onClick={onToggleSidebar}
                style={{
                  padding: '12px 20px',
                  borderRadius: 14,
                  border: '1px solid var(--primary)',
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(192, 132, 252, 0.2))',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <UserPlus style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                <span>Browse Contacts</span>
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              gap: 12,
            }}
          >
            <div style={{ padding: 16, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)' }}>
              <MessageSquare style={{ width: 32, height: 32, color: 'var(--accent)' }} />
            </div>
            <p style={{ fontSize: '0.9rem' }}>
              {isDirect
                ? `No private messages with ${activeChat.target} yet. Say hello!`
                : 'No group messages yet. Say hello to start the conversation!'}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageItem key={idx} message={msg} currentUser={currentUser} />
          ))
        )}

        {/* Typing Status Notification */}
        {typingStatus && !isNone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }} dangerouslySetInnerHTML={{ __html: typingStatus }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      {!isNone && (
        <form
          onSubmit={handleSend}
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder={isDirect ? `Encrypted message to ${activeChat.target}...` : 'Type an encrypted message...'}
            value={inputText}
            onChange={handleInputChange}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="spring-btn"
            style={{
              padding: '14px 20px',
              borderRadius: 16,
              border: 'none',
              background: inputText.trim()
                ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: inputText.trim() ? 1 : 0.5,
              boxShadow: inputText.trim() ? '0 4px 16px rgba(147, 51, 234, 0.4)' : 'none',
            }}
          >
            <Send style={{ width: 18, height: 18 }} />
          </button>
        </form>
      )}
    </main>
  );
};
