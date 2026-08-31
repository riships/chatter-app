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

export interface ServerToClientEvents {
  'img-url': (imgUrl: string) => void;
  'loadPreviousMessages': (messages: any[]) => void;
  'joined-users-details': (users: UserDetails[]) => void;
  'all-users-list': (users: UserAccount[]) => void;
  'user-joined-rooms': (rooms: RoomData[]) => void;
  'message': (data: ChatMessagePayload) => void;
  'typing': (typingHtml: string | null) => void;
  'dis-message': (data: DisconnectMessagePayload) => void;
  'room-details': (room: RoomData) => void;
  'room-error': (error: { message: string }) => void;
  'room-deleted': (data: { roomId: string; message: string }) => void;
  'direct-chat-started': (data: { privateRoomId: string; targetUser: string }) => void;
}

export interface ClientToServerEvents {
  'user': (username: string) => void;
  'create': (roomName: string) => void;
  'img-url': (imgUrl: string) => void;
  'send': (message: string) => void;
  'sendStatus': (msg: string | null | undefined) => void;
  'create-room': (data: { roomId: string; name?: string; description?: string }) => void;
  'join-room': (data: { roomId: string }) => void;
  'leave-group-room': (data: { roomId: string }) => void;
  'delete-group-room': (data: { roomId: string }) => void;
  'update-group-info': (data: { roomId: string; name: string; description?: string }) => void;
  'remove-group-member': (data: { roomId: string; targetUser: string }) => void;
  'start-direct-chat': (data: { targetUser: string }) => void;
  'send-direct': (data: { targetUser: string; text: string }) => void;
  'get-all-users': () => void;
  'get-my-joined-rooms': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user?: string;
  room?: string;
  imgUrl?: string;
}
