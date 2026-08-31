export interface JoinedUser {
  socketId: string;
  user: string;
  user_profile?: string;
  room: string;
  user_type: 'System' | 'User';
  message?: string;
}

export interface UserDetails {
  user_type: 'System' | 'User';
  user: string;
  message: string;
  user_profile?: string;
  isDirect?: boolean;
  recipient?: string;
  roomId?: string;
  timestamp?: string;
}

export interface UserAccount {
  username: string;
  userProfile?: string;
  isOnline: boolean;
  lastSeen?: Date | string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ChatMessagePayload {
  userDetails: UserDetails;
}

export interface DisconnectMessagePayload {
  user: string;
  message: string;
}

export interface RoomData {
  roomId: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  createdAt: Date | string;
}

export type ChatMode = 'none' | 'direct' | 'room';

export interface ActiveChat {
  mode: ChatMode;
  target: string;
}
