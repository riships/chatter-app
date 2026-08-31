import { io, Socket } from 'socket.io-client';

// Connect to current origin or proxy fallback
export const socket: Socket = io({
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
