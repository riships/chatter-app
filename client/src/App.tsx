import React, { useState, useEffect } from 'react';
import { socket } from './services/socket';
import { soundService } from './services/sound';
import { CryptoService } from './services/crypto';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { NotificationToast } from './components/NotificationToast';
import { GroupInfoModal } from './components/GroupInfoModal';
import {
  UserDetails,
  UserAccount,
  ChatMessagePayload,
  DisconnectMessagePayload,
  RoomData,
  ActiveChat,
} from './types/chat';

const SESSION_KEY = 'chatter_user_session';

export const App: React.FC = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('images/user1.jpg');

  const [activeChat, setActiveChat] = useState<ActiveChat>({ mode: 'none', target: '' });
  const [roomDetails, setRoomDetails] = useState<RoomData | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<RoomData[]>([]);
  const [allPublicRooms, setAllPublicRooms] = useState<RoomData[]>([]);
  const [messages, setMessages] = useState<UserDetails[]>([]);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeNotification, setActiveNotification] = useState<{
    message: UserDetails;
    targetName: string;
    isDirect: boolean;
  } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const { username: savedUser, avatarUrl: savedAvatar } = JSON.parse(savedSession);
        if (savedUser) {
          setUsername(savedUser);
          if (savedAvatar) setAvatarUrl(savedAvatar);
          setIsJoined(true);

          if (!socket.connected) {
            socket.connect();
          }

          socket.emit('user', savedUser);
          if (savedAvatar) socket.emit('img-url', savedAvatar);
        }
      } catch (err) {
        console.warn('[Session] Failed to restore session:', err);
      }
    }
  }, []);

  useEffect(() => {
    socket.on('img-url', (imgUrl: string) => {
      if (imgUrl) setAvatarUrl(imgUrl);
    });

    socket.on('room-details', (details: RoomData) => {
      setRoomDetails(details);
      setJoinedRooms((prev) =>
        prev.map((r) => (r.roomId === details.roomId ? details : r))
      );
    });

    socket.on('all-users-list', (users: UserAccount[]) => {
      setAllUsers(users);
    });

    socket.on('user-joined-rooms', (rooms: RoomData[]) => {
      setJoinedRooms(rooms);
    });

    socket.on('all-public-rooms', (rooms: RoomData[]) => {
      setAllPublicRooms(rooms);
    });

    socket.on('room-deleted', (data: { roomId: string; message: string }) => {
      setJoinedRooms((prev) => prev.filter((r) => r.roomId !== data.roomId));
      setAllPublicRooms((prev) => prev.filter((r) => r.roomId !== data.roomId));
      setActiveChat((prev) => {
        if (prev.mode === 'room' && prev.target === data.roomId) {
          return { mode: 'none', target: '' };
        }
        return prev;
      });
      setMessages([]);
      setIsGroupInfoOpen(false);
    });

    socket.on('loadPreviousMessages', (previousMessages: any[]) => {
      const formatted: UserDetails[] = previousMessages.map((msg) => ({
        user_type: 'User',
        user: msg.username,
        message: msg.text,
        user_profile: msg.userProfile || 'images/user1.jpg',
        isDirect: msg.isDirect,
        recipient: msg.recipient,
        roomId: msg.roomId,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setMessages(formatted);
    });

    socket.on('message', (data: ChatMessagePayload) => {
      const msg = data.userDetails;
      setMessages((prev) => [...prev, msg]);

      if (msg.user_type === 'User' && msg.user !== username) {
        const isDirect = !!msg.isDirect;
        const targetName = isDirect ? msg.user : msg.roomId || roomId;

        const isCurrentlyViewed =
          (activeChat.mode === 'direct' && isDirect && activeChat.target === msg.user) ||
          (activeChat.mode === 'room' && !isDirect && activeChat.target === msg.roomId);

        if (!isCurrentlyViewed || document.hidden) {
          soundService.playNotificationChime();

          setUnreadCounts((prev) => ({
            ...prev,
            [targetName]: (prev[targetName] || 0) + 1,
          }));

          const channelKey = CryptoService.getChannelKey(msg.roomId || '', username, msg.recipient);
          const decryptedSnippet = CryptoService.decryptText(msg.message, channelKey);

          setActiveNotification({
            message: { ...msg, message: decryptedSnippet },
            targetName: isDirect ? msg.user : targetName,
            isDirect,
          });

          if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
            new Notification(msg.user, {
              body: decryptedSnippet,
              icon: msg.user_profile || 'images/user1.jpg',
            });
          }
        }
      }
    });

    socket.on('dis-message', (msgData: DisconnectMessagePayload) => {
      const sysMessage: UserDetails = {
        user_type: 'System',
        user: msgData.user,
        message: msgData.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, sysMessage]);
    });

    socket.on('typing', (status: string | null) => {
      setTypingStatus(status);
    });

    return () => {
      socket.off('img-url');
      socket.off('room-details');
      socket.off('all-users-list');
      socket.off('user-joined-rooms');
      socket.off('all-public-rooms');
      socket.off('room-deleted');
      socket.off('loadPreviousMessages');
      socket.off('message');
      socket.off('dis-message');
      socket.off('typing');
    };
  }, [username, activeChat, roomId]);

  const handleLogin = async (user: string, pass: string, avatar: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass, userProfile: avatar }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return false;
      }

      setUsername(user);
      setAvatarUrl(avatar);
      setActiveChat({ mode: 'none', target: '' });

      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user, avatarUrl: avatar }));

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('user', user);
      socket.emit('img-url', avatar);

      setIsJoined(true);
      return true;
    } catch (err) {
      console.error('[Auth Error] REST login failed:', err);
      return false;
    }
  };

  const handleJoinRoom = (selectedRoomId: string) => {
    setRoomId(selectedRoomId);
    setActiveChat({ mode: 'room', target: selectedRoomId });
    setUnreadCounts((prev) => ({ ...prev, [selectedRoomId]: 0 }));
    socket.emit('create', selectedRoomId);
  };

  const handleSelectDirectChat = (targetUser: string) => {
    setActiveChat({ mode: 'direct', target: targetUser });
    setUnreadCounts((prev) => ({ ...prev, [targetUser]: 0 }));
    socket.emit('start-direct-chat', { targetUser });
  };

  const handleLeaveGroupRoom = (targetRoomId: string) => {
    socket.emit('leave-group-room', { roomId: targetRoomId });
    setActiveChat({ mode: 'none', target: '' });
    setRoomId('');
    setMessages([]);
    setIsGroupInfoOpen(false);
  };

  const handleDeleteGroupRoom = (targetRoomId: string) => {
    socket.emit('delete-group-room', { roomId: targetRoomId });
    setActiveChat({ mode: 'none', target: '' });
    setRoomId('');
    setMessages([]);
    setIsGroupInfoOpen(false);
  };

  const handleUpdateGroupInfo = (name: string, description: string) => {
    if (activeChat.mode === 'room' && activeChat.target) {
      socket.emit('update-group-info', {
        roomId: activeChat.target,
        name,
        description,
      });
    }
  };

  const handleRemoveMember = (targetUser: string) => {
    if (activeChat.mode === 'room' && activeChat.target) {
      socket.emit('remove-group-member', {
        roomId: activeChat.target,
        targetUser,
      });
    }
  };

  const handleSendMessage = (msgText: string) => {
    if (activeChat.mode === 'direct') {
      const channelKey = CryptoService.getChannelKey('', username, activeChat.target);
      const encryptedPayload = CryptoService.encryptText(msgText, channelKey);
      socket.emit('send-direct', { targetUser: activeChat.target, text: encryptedPayload });
    } else if (activeChat.mode === 'room') {
      const channelKey = CryptoService.getChannelKey(activeChat.target, username);
      const encryptedPayload = CryptoService.encryptText(msgText, channelKey);
      socket.emit('send', encryptedPayload);
    }
  };

  const handleTyping = (typingText: string) => {
    socket.emit('sendStatus', typingText);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);

    if (socket.connected) {
      socket.disconnect();
    }
    setIsJoined(false);
    setMessages([]);
    setAllUsers([]);
    setJoinedRooms([]);
    setAllPublicRooms([]);
    setRoomDetails(null);
    setRoomId('');
    setUnreadCounts({});
    setActiveChat({ mode: 'none', target: '' });
    setIsGroupInfoOpen(false);
  };

  if (!isJoined) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <NotificationToast
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
        onSelectChat={(targetName, isDirect) => {
          if (isDirect) {
            handleSelectDirectChat(targetName);
          } else {
            handleJoinRoom(targetName);
          }
        }}
      />

      <GroupInfoModal
        roomDetails={roomDetails}
        allUsers={allUsers}
        currentUser={username}
        isOpen={isGroupInfoOpen}
        onClose={() => setIsGroupInfoOpen(false)}
        onUpdateGroupInfo={handleUpdateGroupInfo}
        onRemoveMember={handleRemoveMember}
        onDeleteGroup={() => handleDeleteGroupRoom(activeChat.target)}
      />

      {/* Mobile Backdrop Overlay when Sidebar is drawer-open on small screens */}
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar
        currentUser={username}
        currentRoom={roomId}
        roomDetails={roomDetails}
        allUsers={allUsers}
        joinedRooms={joinedRooms}
        allPublicRooms={allPublicRooms}
        activeMode={activeChat.mode}
        activeTarget={activeChat.target}
        unreadCounts={unreadCounts}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onLeaveRoom={handleLogout}
        onJoinRoom={handleJoinRoom}
        onSelectDirectChat={handleSelectDirectChat}
      />

      <ChatWindow
        currentUser={username}
        currentRoom={roomId}
        roomDetails={roomDetails}
        allUsers={allUsers}
        avatarUrl={avatarUrl}
        activeChat={activeChat}
        messages={messages}
        typingStatus={typingStatus}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLeaveGroupRoom={handleLeaveGroupRoom}
        onDeleteGroupRoom={handleDeleteGroupRoom}
        onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
      />
    </div>
  );
};

export default App;
