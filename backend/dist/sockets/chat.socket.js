import Message from '../models/message.model.js';
import Room from '../models/room.model.js';
import User from '../models/user.model.js';
import { presenceManager } from './presence.manager.js';
export const getDirectRoomId = (userA, userB) => {
    return [userA, userB].sort().join('_direct_');
};
const broadcastAllUsers = async (io) => {
    try {
        const users = await User.find().sort({ isOnline: -1, lastSeen: -1 });
        const userAccounts = users.map((u) => ({
            username: u.username,
            userProfile: u.userProfile,
            isOnline: u.isOnline,
            lastSeen: u.lastSeen,
        }));
        io.emit('all-users-list', userAccounts);
    }
    catch (err) {
        console.error('[Socket Error] Failed to broadcast user accounts:', err);
    }
};
const sendUserJoinedRooms = async (socket, username) => {
    try {
        const rooms = await Room.find({ members: username }).sort({ createdAt: -1 });
        const roomPayloads = rooms.map((r) => ({
            roomId: r.roomId,
            name: r.name,
            description: r.description,
            createdBy: r.createdBy,
            members: r.members,
            createdAt: r.createdAt,
        }));
        socket.emit('user-joined-rooms', roomPayloads);
    }
    catch (err) {
        console.error('[Socket Error] Failed to fetch user joined rooms:', err);
    }
};
const refreshJoinedRoomsForMembers = async (io, members) => {
    try {
        const activeSockets = await io.fetchSockets();
        for (const memberUsername of members) {
            const userSockets = activeSockets.filter((s) => s.data.user === memberUsername);
            if (userSockets.length > 0) {
                const rooms = await Room.find({ members: memberUsername }).sort({ createdAt: -1 });
                const roomPayloads = rooms.map((r) => ({
                    roomId: r.roomId,
                    name: r.name,
                    description: r.description,
                    createdBy: r.createdBy,
                    members: r.members,
                    createdAt: r.createdAt,
                }));
                for (const s of userSockets) {
                    s.emit('user-joined-rooms', roomPayloads);
                }
            }
        }
    }
    catch (err) {
        console.error('[Socket Error] Failed to refresh member joined rooms:', err);
    }
};
export const registerChatSocketHandlers = (io, socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);
    const handleRoomJoin = async () => {
        const { user, room, imgUrl } = socket.data;
        if (!user || !room) {
            return;
        }
        try {
            if (room.includes('_direct_')) {
                socket.join(room);
                const previousMessages = await Message.find({ roomId: room })
                    .sort({ timestamp: -1 })
                    .limit(50);
                socket.emit('loadPreviousMessages', previousMessages.reverse());
                return;
            }
            let roomDoc = await Room.findOne({ roomId: room });
            if (!roomDoc) {
                roomDoc = await Room.create({
                    roomId: room,
                    name: room,
                    createdBy: user,
                    members: [user],
                });
                console.log(`[Room] Created new room '${room}' by creator: ${user}`);
            }
            else {
                if (!roomDoc.members.includes(user)) {
                    roomDoc.members.push(user);
                    await roomDoc.save();
                    console.log(`[Room] Added user '${user}' as a member to room '${room}'`);
                }
            }
            socket.join(room);
            const joinMessage = `${user} has joined the chat`;
            const userDetails = {
                user_type: 'System',
                user: user,
                message: joinMessage,
                user_profile: imgUrl || '',
            };
            const roomPayload = {
                roomId: roomDoc.roomId,
                name: roomDoc.name,
                description: roomDoc.description,
                createdBy: roomDoc.createdBy,
                members: roomDoc.members,
                createdAt: roomDoc.createdAt,
            };
            socket.emit('room-details', roomPayload);
            const previousMessages = await Message.find({
                $or: [{ roomId: room }, { roomId: { $exists: false } }],
            })
                .sort({ timestamp: -1 })
                .limit(50);
            socket.emit('loadPreviousMessages', previousMessages.reverse());
            io.emit('joined-users-details', presenceManager.getAllJoinedUsers());
            socket.broadcast.to(room).emit('message', { userDetails });
            await sendUserJoinedRooms(socket, user);
        }
        catch (err) {
            console.error('[Socket Error] Room join error:', err.message || err);
            socket.emit('room-error', { message: 'Failed to join or create room' });
        }
    };
    // Event: 'user'
    socket.on('user', async (username) => {
        socket.data.user = username;
        try {
            await User.findOneAndUpdate({ username }, {
                username,
                userProfile: socket.data.imgUrl || 'images/user1.jpg',
                isOnline: true,
                lastSeen: new Date(),
            }, { upsert: true, new: true });
            const userDetails = {
                user_type: 'User',
                user: username,
                message: `${username} is online`,
                user_profile: socket.data.imgUrl || 'images/user1.jpg',
            };
            presenceManager.addUser(socket.id, userDetails);
            io.emit('joined-users-details', presenceManager.getAllJoinedUsers());
            await broadcastAllUsers(io);
            await sendUserJoinedRooms(socket, username);
            if (socket.data.room) {
                handleRoomJoin();
            }
        }
        catch (err) {
            console.error('[Socket Error] Failed to register user login:', err);
        }
    });
    // Event: 'get-my-joined-rooms'
    socket.on('get-my-joined-rooms', async () => {
        const { user } = socket.data;
        if (user) {
            await sendUserJoinedRooms(socket, user);
        }
    });
    // Event: 'update-group-info' (Edit Group Name & Description)
    socket.on('update-group-info', async (data) => {
        const { user } = socket.data;
        if (!user || !data.roomId || !data.name)
            return;
        try {
            const roomDoc = await Room.findOne({ roomId: data.roomId });
            if (!roomDoc) {
                socket.emit('room-error', { message: 'Room not found' });
                return;
            }
            if (roomDoc.createdBy !== user) {
                socket.emit('room-error', { message: 'Only the group creator can edit group details' });
                return;
            }
            roomDoc.name = data.name.trim();
            roomDoc.description = data.description?.trim() || '';
            await roomDoc.save();
            const updatedPayload = {
                roomId: roomDoc.roomId,
                name: roomDoc.name,
                description: roomDoc.description,
                createdBy: roomDoc.createdBy,
                members: roomDoc.members,
                createdAt: roomDoc.createdAt,
            };
            io.in(data.roomId).emit('room-details', updatedPayload);
            const updateSysMessage = {
                user_type: 'System',
                user: user,
                message: `${user} updated the group info`,
            };
            io.in(data.roomId).emit('message', { userDetails: updateSysMessage });
            await refreshJoinedRoomsForMembers(io, roomDoc.members);
            console.log(`[Room] Group '${data.roomId}' updated by admin ${user}`);
        }
        catch (err) {
            console.error('[Socket Error] Failed to update group info:', err.message || err);
        }
    });
    // Event: 'remove-group-member' (Kick Member by Admin)
    socket.on('remove-group-member', async (data) => {
        const { user } = socket.data;
        if (!user || !data.roomId || !data.targetUser)
            return;
        try {
            const roomDoc = await Room.findOne({ roomId: data.roomId });
            if (!roomDoc) {
                socket.emit('room-error', { message: 'Room not found' });
                return;
            }
            if (roomDoc.createdBy !== user) {
                socket.emit('room-error', { message: 'Only the group creator can remove members' });
                return;
            }
            const prevMembers = [...roomDoc.members];
            roomDoc.members = roomDoc.members.filter((m) => m !== data.targetUser);
            await roomDoc.save();
            const updatedPayload = {
                roomId: roomDoc.roomId,
                name: roomDoc.name,
                description: roomDoc.description,
                createdBy: roomDoc.createdBy,
                members: roomDoc.members,
                createdAt: roomDoc.createdAt,
            };
            io.in(data.roomId).emit('room-details', updatedPayload);
            const removeMessage = {
                user_type: 'System',
                user: user,
                message: `${data.targetUser} was removed from the group by ${user}`,
            };
            io.in(data.roomId).emit('message', { userDetails: removeMessage });
            await refreshJoinedRoomsForMembers(io, prevMembers);
            console.log(`[Room] User '${data.targetUser}' removed from room '${data.roomId}' by admin ${user}`);
        }
        catch (err) {
            console.error('[Socket Error] Failed to remove group member:', err.message || err);
        }
    });
    // Event: 'leave-group-room'
    socket.on('leave-group-room', async (data) => {
        const { user } = socket.data;
        if (!user || !data.roomId)
            return;
        try {
            const roomDoc = await Room.findOne({ roomId: data.roomId });
            if (roomDoc) {
                const prevMembers = [...roomDoc.members];
                roomDoc.members = roomDoc.members.filter((m) => m !== user);
                await roomDoc.save();
                socket.leave(data.roomId);
                console.log(`[Room] User ${user} left room ${data.roomId}`);
                const leaveMessage = {
                    user_type: 'System',
                    user: user,
                    message: `${user} left the group`,
                };
                socket.broadcast.to(data.roomId).emit('message', { userDetails: leaveMessage });
                await refreshJoinedRoomsForMembers(io, prevMembers);
            }
        }
        catch (err) {
            console.error('[Socket Error] Leave group error:', err.message || err);
        }
    });
    // Event: 'delete-group-room'
    socket.on('delete-group-room', async (data) => {
        const { user } = socket.data;
        if (!user || !data.roomId)
            return;
        try {
            const roomDoc = await Room.findOne({ roomId: data.roomId });
            if (!roomDoc) {
                socket.emit('room-error', { message: 'Room not found' });
                return;
            }
            if (roomDoc.createdBy !== user) {
                socket.emit('room-error', { message: 'Only the room creator can delete this group' });
                return;
            }
            const prevMembers = [...roomDoc.members];
            await Room.deleteOne({ roomId: data.roomId });
            await Message.deleteMany({ roomId: data.roomId });
            io.in(data.roomId).emit('room-deleted', {
                roomId: data.roomId,
                message: `Group '${data.roomId}' was deleted by owner ${user}`,
            });
            console.log(`[Room] Group '${data.roomId}' deleted by owner ${user}`);
            await refreshJoinedRoomsForMembers(io, prevMembers);
        }
        catch (err) {
            console.error('[Socket Error] Delete group error:', err.message || err);
        }
    });
    // Event: 'create' (Join Group Room)
    socket.on('create', (roomName) => {
        socket.data.room = roomName;
        handleRoomJoin();
    });
    // Event: 'start-direct-chat'
    socket.on('start-direct-chat', async (data) => {
        const { user } = socket.data;
        if (!user || !data.targetUser)
            return;
        const privateRoomId = getDirectRoomId(user, data.targetUser);
        socket.data.room = privateRoomId;
        socket.join(privateRoomId);
        try {
            const previousMessages = await Message.find({ roomId: privateRoomId })
                .sort({ timestamp: -1 })
                .limit(50);
            socket.emit('loadPreviousMessages', previousMessages.reverse());
            socket.emit('direct-chat-started', { privateRoomId, targetUser: data.targetUser });
        }
        catch (err) {
            console.error('[Socket Error] Direct chat error:', err.message || err);
        }
    });
    // Event: 'send-direct'
    socket.on('send-direct', async (data) => {
        const { user, imgUrl } = socket.data;
        if (!user || !data.targetUser || !data.text)
            return;
        const privateRoomId = getDirectRoomId(user, data.targetUser);
        try {
            const storeMessage = new Message({
                roomId: privateRoomId,
                username: user,
                text: data.text,
                userProfile: imgUrl,
                isDirect: true,
                recipient: data.targetUser,
            });
            await storeMessage.save();
            const userDetails = {
                user_type: 'User',
                user: user,
                message: data.text,
                user_profile: imgUrl,
                isDirect: true,
                recipient: data.targetUser,
                roomId: privateRoomId,
            };
            io.in(privateRoomId).emit('message', { userDetails });
            await broadcastAllUsers(io);
        }
        catch (err) {
            console.error('[Socket Error] Failed to persist direct message:', err);
        }
    });
    // Event: 'send'
    socket.on('send', async (msg) => {
        const { user, room, imgUrl } = socket.data;
        if (!msg || !user || !room)
            return;
        try {
            const isDirect = room.includes('_direct_');
            const storeMessage = new Message({
                roomId: room,
                username: user,
                text: msg,
                userProfile: imgUrl,
                isDirect,
            });
            await storeMessage.save();
            const userDetails = {
                user_type: 'User',
                user: user,
                message: msg,
                user_profile: imgUrl,
                isDirect,
                roomId: room,
            };
            io.in(room).emit('message', { userDetails });
        }
        catch (err) {
            console.error('[Socket Error] Failed to persist message:', err);
        }
    });
    // Event: 'img-url'
    socket.on('img-url', async (imgUrl) => {
        socket.data.imgUrl = imgUrl;
        const { user } = socket.data;
        if (user) {
            await User.findOneAndUpdate({ username: user }, { userProfile: imgUrl });
            await broadcastAllUsers(io);
        }
        const userDetails = presenceManager.getUserBySocketId(socket.id);
        if (userDetails) {
            userDetails.user_profile = imgUrl;
            io.emit('joined-users-details', presenceManager.getAllJoinedUsers());
        }
    });
    // Event: 'sendStatus'
    socket.on('sendStatus', (msg) => {
        const { user, room } = socket.data;
        if (!room)
            return;
        if (!msg) {
            socket.to(room).emit('typing', null);
        }
        else {
            socket.to(room).emit('typing', `<b>${user || 'Someone'}:-</b> ${msg}`);
        }
    });
    // Event: 'disconnect'
    socket.on('disconnect', async () => {
        const { user } = socket.data;
        presenceManager.removeUser(socket.id);
        if (user) {
            // Only set user offline if NO active sockets remain for this user
            const stillActive = presenceManager.isUserJoined(user);
            if (!stillActive) {
                try {
                    await User.findOneAndUpdate({ username: user }, { isOnline: false, lastSeen: new Date() });
                    console.log(`[Socket] User '${user}' disconnected and marked OFFLINE.`);
                }
                catch (err) {
                    console.error('[Socket Error] Failed to update user disconnect state:', err);
                }
            }
            io.emit('joined-users-details', presenceManager.getAllJoinedUsers());
            await broadcastAllUsers(io);
        }
    });
};
