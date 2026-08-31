import React, { useState } from 'react';
import { UserAccount, RoomData, ChatMode } from '../types/chat';
import { Search, MessageSquare, Plus, LogOut, X, Hash, MessageCircle, ShieldCheck, Users, Globe, ArrowRight } from 'lucide-react';

interface SidebarProps {
  currentUser: string;
  currentRoom: string;
  roomDetails?: RoomData | null;
  allUsers: UserAccount[];
  joinedRooms: RoomData[];
  allPublicRooms?: RoomData[];
  activeMode: ChatMode;
  activeTarget: string;
  unreadCounts: Record<string, number>;
  isOpen: boolean;
  onCloseMobile: () => void;
  onLeaveRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onSelectDirectChat: (targetUser: string) => void;
}

type TabCategory = 'all' | 'direct' | 'groups';

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  allUsers,
  joinedRooms,
  allPublicRooms = [],
  activeMode,
  activeTarget,
  unreadCounts,
  isOpen,
  onCloseMobile,
  onLeaveRoom,
  onJoinRoom,
  onSelectDirectChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [newRoomId, setNewRoomId] = useState('');

  const currentUserAccount = allUsers.find((u) => u.username === currentUser);

  const filteredUsers = allUsers
    .filter((u) => u.username !== currentUser)
    .filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredJoinedRooms = joinedRooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Discoverable public rooms that the user hasn't joined yet
  const joinedRoomIds = new Set(joinedRooms.map((r) => r.roomId));
  const discoverablePublicRooms = allPublicRooms.filter(
    (r) =>
      !joinedRoomIds.has(r.roomId) &&
      (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roomId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomId.trim()) {
      onJoinRoom(newRoomId.trim());
      setNewRoomId('');
      setShowRoomInput(false);
    }
  };

  const formatLastSeen = (dateStr?: string | Date) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    return `Last seen ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <aside
      className="glass-panel"
      style={{
        width: 330,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--glass-border)',
        zIndex: 40,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        position: window.innerWidth <= 768 ? 'fixed' : 'relative',
        left: 0,
        top: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        boxShadow: '4px 0 30px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Top Header - Logged In User Profile */}
      <div
        style={{
          padding: '22px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.15), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={currentUserAccount?.userProfile || 'images/user1.jpg'}
              alt={currentUser}
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent)',
                boxShadow: '0 4px 14px rgba(192, 132, 252, 0.4)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid #0f172a',
                boxShadow: '0 0 8px #22c55e',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                {currentUser}
              </h2>
              <ShieldCheck style={{ width: 15, height: 15, color: 'var(--accent)' }} />
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', fontStyle: 'italic', marginTop: 1 }}>
              Building something awesome 🚀
            </span>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: window.innerWidth <= 768 ? 'block' : 'none',
          }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* Cool Filter Navigation Tabs */}
      <div
        style={{
          padding: '12px 14px 4px 14px',
          display: 'flex',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <button
          className="spring-btn"
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 12,
            border: activeTab === 'all' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'all' ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(192, 132, 252, 0.2))' : 'rgba(255, 255, 255, 0.04)',
            color: activeTab === 'all' ? '#fff' : 'var(--text-muted)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <MessageCircle style={{ width: 14, height: 14 }} />
          <span>All</span>
        </button>

        <button
          className="spring-btn"
          onClick={() => setActiveTab('direct')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 12,
            border: activeTab === 'direct' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'direct' ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(192, 132, 252, 0.2))' : 'rgba(255, 255, 255, 0.04)',
            color: activeTab === 'direct' ? '#fff' : 'var(--text-muted)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <MessageSquare style={{ width: 14, height: 14 }} />
          <span>DMs</span>
        </button>

        <button
          className="spring-btn"
          onClick={() => setActiveTab('groups')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 12,
            border: activeTab === 'groups' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'groups' ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(192, 132, 252, 0.2))' : 'rgba(255, 255, 255, 0.04)',
            color: activeTab === 'groups' ? '#fff' : 'var(--text-muted)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <Users style={{ width: 14, height: 14 }} />
          <span>Groups</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '10px 14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Search style={{ color: 'var(--text-muted)', width: 16, height: 16 }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Group Channels Section */}
      {(activeTab === 'all' || activeTab === 'groups') && (
        <div style={{ padding: '4px 14px 8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Joined Groups ({filteredJoinedRooms.length})
            </span>
            <button
              onClick={() => setShowRoomInput(!showRoomInput)}
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
              <Plus style={{ width: 14, height: 14 }} />
              <span>Join/Create</span>
            </button>
          </div>

          {showRoomInput && (
            <form onSubmit={handleRoomSubmit} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input
                type="text"
                placeholder="Enter Room ID..."
                value={newRoomId}
                onChange={(e) => setNewRoomId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Join
              </button>
            </form>
          )}

          {filteredJoinedRooms.map((r, idx) => {
            const isSelected = activeMode === 'room' && activeTarget === r.roomId;
            const unreadCount = unreadCounts[r.roomId] || 0;

            return (
              <button
                key={idx}
                className="spring-btn"
                onClick={() => {
                  onJoinRoom(r.roomId);
                  if (window.innerWidth <= 768) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 14,
                  border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(192, 132, 252, 0.25))'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isSelected ? '0 4px 16px rgba(192, 132, 252, 0.3)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Hash style={{ width: 18, height: 18, color: isSelected ? '#fff' : 'var(--accent)' }} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.88rem', color: isSelected ? 'var(--accent)' : '#fff' }}>
                      {r.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {r.members ? r.members.length : 1} members
                    </span>
                  </div>
                </div>

                {unreadCount > 0 && !isSelected && (
                  <span
                    style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      boxShadow: '0 2px 8px rgba(147, 51, 234, 0.4)',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Discoverable Public Groups Created by Anyone */}
          {discoverablePublicRooms.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ padding: '6px 2px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe style={{ width: 13, height: 13 }} />
                <span>Explore Public Groups ({discoverablePublicRooms.length})</span>
              </div>

              {discoverablePublicRooms.map((r, idx) => (
                <button
                  key={idx}
                  className="spring-btn"
                  onClick={() => {
                    onJoinRoom(r.roomId);
                    if (window.innerWidth <= 768) onCloseMobile();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px border-dashed rgba(192, 132, 252, 0.3)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    marginBottom: 4,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Hash style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                    <span>{r.name}</span>
                  </div>

                  <span style={{ fontSize: '0.74rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                    <span>Join</span>
                    <ArrowRight style={{ width: 12, height: 12 }} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Contacts Roster */}
      {(activeTab === 'all' || activeTab === 'direct') && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px 14px' }}>
          <div style={{ padding: '8px 4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Direct Contacts ({filteredUsers.length})
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No contacts found
            </div>
          ) : (
            filteredUsers.map((u, idx) => {
              const isMe = u.username === currentUser;
              const isSelectedDirect = activeMode === 'direct' && activeTarget === u.username;
              const unreadCount = unreadCounts[u.username] || 0;

              return (
                <div
                  key={idx}
                  className="spring-btn"
                  onClick={() => {
                    if (!isMe) {
                      onSelectDirectChat(u.username);
                      if (window.innerWidth <= 768) onCloseMobile();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 14,
                    marginBottom: 6,
                    background: isSelectedDirect
                      ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(192, 132, 252, 0.25))'
                      : isMe
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(255, 255, 255, 0.06)',
                    border: isSelectedDirect ? '1px solid var(--accent)' : '1px solid transparent',
                    cursor: isMe ? 'default' : 'pointer',
                    boxShadow: isSelectedDirect ? '0 4px 16px rgba(192, 132, 252, 0.3)' : 'none',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={u.userProfile || 'images/user1.jpg'}
                      alt={u.username}
                      style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: u.isOnline ? '#22c55e' : '#94a3b8',
                        border: '2px solid #0f172a',
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelectedDirect ? 'var(--accent)' : '#fff' }}>
                        {u.username} {isMe && '(You)'}
                      </span>

                      {unreadCount > 0 && !isSelectedDirect ? (
                        <span
                          style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.4)',
                          }}
                        >
                          {unreadCount}
                        </span>
                      ) : (
                        !isMe && (
                          <MessageSquare style={{ width: 14, height: 14, color: isSelectedDirect ? 'var(--accent)' : 'var(--text-muted)' }} />
                        )
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: u.isOnline ? '#22c55e' : 'var(--text-muted)' }}>
                      {isMe ? 'Logged In' : u.isOnline ? 'Online' : formatLastSeen(u.lastSeen)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Logout Button */}
      <div style={{ padding: 16, borderTop: '1px solid var(--border-color)' }}>
        <button
          className="spring-btn"
          onClick={onLeaveRoom}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 14,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
