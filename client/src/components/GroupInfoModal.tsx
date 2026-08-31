import React, { useState, useEffect } from 'react';
import { RoomData, UserAccount } from '../types/chat';
import { X, Crown, Users, Calendar, ShieldCheck, Edit3, Check, UserMinus, Trash2 } from 'lucide-react';

interface GroupInfoModalProps {
  roomDetails: RoomData | null;
  allUsers: UserAccount[];
  currentUser: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGroupInfo: (name: string, description: string) => void;
  onRemoveMember: (targetUser: string) => void;
  onDeleteGroup: () => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  roomDetails,
  allUsers,
  currentUser,
  isOpen,
  onClose,
  onUpdateGroupInfo,
  onRemoveMember,
  onDeleteGroup,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    if (roomDetails) {
      setEditName(roomDetails.name);
      setEditDesc(roomDetails.description || '');
    }
  }, [roomDetails]);

  if (!isOpen || !roomDetails) return null;

  const isAdmin = roomDetails.createdBy === currentUser;

  const createdDate = roomDetails.createdAt
    ? new Date(roomDetails.createdAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  const memberList = roomDetails.members.map((username) => {
    const userAcc = allUsers.find((u) => u.username === username);
    return {
      username,
      userProfile: userAcc?.userProfile || 'images/user1.jpg',
      isOnline: userAcc?.isOnline || false,
      lastSeen: userAcc?.lastSeen,
      isGroupAdmin: username === roomDetails.createdBy,
    };
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onUpdateGroupInfo(editName.trim(), editDesc.trim());
      setIsEditing(false);
    }
  };

  const formatLastSeen = (dateStr?: string | Date) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    return `Last seen ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: '85vh',
          borderRadius: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users style={{ color: '#fff', width: 22, height: 22 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {roomDetails.name}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Group Info & Settings
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
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
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Group Name & Description Section (Editable by Admin) */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Group Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--primary)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Group Description
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="What is this group about?"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Check style={{ width: 14, height: 14 }} />
                <span>Save</span>
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                {roomDetails.name}
              </span>
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <Edit3 style={{ width: 14, height: 14 }} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: roomDetails.description ? 'normal' : 'italic' }}>
              {roomDetails.description || 'No group description set.'}
            </p>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                Created {createdDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck style={{ width: 13, height: 13, color: 'var(--primary)' }} />
                {memberList.length} Members
              </span>
            </div>
          </div>
        )}

        {/* Member Roster List */}
        <div style={{ marginTop: 20, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Group Members ({memberList.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memberList.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: m.username === currentUser ? 'rgba(170, 77, 188, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: m.isGroupAdmin ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid var(--border-color)',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={m.userProfile}
                    alt={m.username}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: m.isOnline ? '#22c55e' : '#94a3b8',
                      border: '2px solid #0f172a',
                    }}
                  />
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                      {m.username} {m.username === currentUser && '(You)'}
                    </span>

                    {m.isGroupAdmin && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#eab308',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          fontWeight: 600,
                        }}
                      >
                        <Crown style={{ width: 11, height: 11 }} />
                        <span>Admin</span>
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: m.isOnline ? '#22c55e' : 'var(--text-muted)' }}>
                    {m.isOnline ? 'Online' : formatLastSeen(m.lastSeen)}
                  </span>
                </div>

                {/* Admin Member Kick Button */}
                {isAdmin && !m.isGroupAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${m.username} from group?`)) {
                        onRemoveMember(m.username);
                      }
                    }}
                    title={`Remove ${m.username}`}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 8,
                      color: '#ef4444',
                      padding: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UserMinus style={{ width: 15, height: 15 }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delete Group Button anchored at bottom for Admin */}
        {isAdmin && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => {
                if (confirm(`Delete group '${roomDetails.name}' permanently for all members?`)) {
                  onDeleteGroup();
                  onClose();
                }
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s ease',
              }}
            >
              <Trash2 style={{ width: 16, height: 16 }} />
              <span>Delete Group Permanently</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
