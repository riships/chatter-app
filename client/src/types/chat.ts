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
  lastSeen?: string;
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
  createdAt: string;
}

export interface HistoricalMessage {
  _id?: string;
  roomId?: string;
  username: string;
  text: string;
  userProfile?: string;
  isDirect?: boolean;
  recipient?: string;
  timestamp: string;
}

export type ChatMode = 'none' | 'room' | 'direct';

export interface ActiveChat {
  mode: ChatMode;
  target: string; // roomId if 'room', username if 'direct'
}
