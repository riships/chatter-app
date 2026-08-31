import React, { useEffect } from 'react';
import { UserDetails } from '../types/chat';
import { X } from 'lucide-react';

interface NotificationToastProps {
  notification: {
    message: UserDetails;
    targetName: string;
    isDirect: boolean;
  } | null;
  onClose: () => void;
  onSelectChat: (targetName: string, isDirect: boolean) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onSelectChat,
}) => {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { message, targetName, isDirect } = notification;

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 100,
        width: 340,
        padding: '14px 16px',
        borderRadius: 18,
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid var(--accent)',
        boxShadow: '0 12px 30px rgba(168, 85, 247, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
      }}
      onClick={() => {
        onSelectChat(targetName, isDirect);
        onClose();
      }}
    >
      <img
        src={message.user_profile || 'images/user1.jpg'}
        alt={message.user}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--primary)',
        }}
      />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
            {message.user}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 500 }}>
            {isDirect ? '1-on-1' : 'Room'}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0,
          }}
        >
          {message.message}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
};
