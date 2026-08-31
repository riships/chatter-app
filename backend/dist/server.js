import { createServer } from 'node:http';
import { Server } from 'socket.io';
import config from './config/env.js';
import connectMongoDb from './config/db.js';
import createApp from './app.js';
import User from './models/user.model.js';
import { presenceManager } from './sockets/presence.manager.js';
import { registerChatSocketHandlers } from './sockets/chat.socket.js';
const startServer = async () => {
    // 1. Connect Database
    await connectMongoDb();
    // Reset stale online flags on server startup
    try {
        const res = await User.updateMany({ isOnline: true }, { isOnline: false, lastSeen: new Date() });
        console.log(`[Presence Cleanup] Reset ${res.modifiedCount} stale online user records on startup.`);
    }
    catch (err) {
        console.error('[Presence Cleanup Error] Failed to reset startup online status:', err);
    }
    // 2. Initialize Express Application
    const app = createApp();
    // 3. Create HTTP & Socket.IO Server
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: config.CLIENT_ORIGIN,
            methods: ['GET', 'POST'],
        },
        pingInterval: 10000,
        pingTimeout: 5000,
    });
    // Periodic Stale Presence Sync (every 15 seconds)
    setInterval(async () => {
        try {
            const activeUsernames = presenceManager.getUniqueOnlineUsernames();
            const staleUsers = await User.find({
                isOnline: true,
                username: { $nin: activeUsernames },
            });
            if (staleUsers.length > 0) {
                await User.updateMany({ username: { $in: staleUsers.map((u) => u.username) } }, { isOnline: false, lastSeen: new Date() });
                // Broadcast updated contact list to all connected clients
                const users = await User.find().sort({ isOnline: -1, lastSeen: -1 });
                io.emit('all-users-list', users.map((u) => ({
                    username: u.username,
                    userProfile: u.userProfile,
                    isOnline: u.isOnline,
                    lastSeen: u.lastSeen,
                })));
                console.log(`[Presence Sync] Cleaned up ${staleUsers.length} orphaned online user(s).`);
            }
        }
        catch (err) {
            console.error('[Presence Sync Error]:', err);
        }
    }, 15000);
    // 4. Register Socket Event Handlers
    io.on('connection', (socket) => {
        registerChatSocketHandlers(io, socket);
    });
    // 5. Start Listening
    const PORT = config.PORT;
    httpServer.listen(PORT, () => {
        console.log(`[Server] Express + TypeScript Chat Server running on http://localhost:${PORT}`);
    });
    // Graceful Shutdown
    const shutdown = async () => {
        console.log('\n[Server] Shutting down gracefully...');
        try {
            await User.updateMany({ isOnline: true }, { isOnline: false, lastSeen: new Date() });
        }
        catch (e) {
            console.error('[Shutdown Error] Failed to mark users offline:', e);
        }
        httpServer.close(() => {
            console.log('[Server] HTTP and Socket server closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};
startServer().catch((err) => {
    console.error('[Server Error] Failed to start server:', err);
});
