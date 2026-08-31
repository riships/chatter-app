import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import Message from '../models/message.model.js';
import Room from '../models/room.model.js';
import User from '../models/user.model.js';
import { presenceManager } from '../sockets/presence.manager.js';

const router = Router();

// Password hashing utility using SHA-256
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Health Check Endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// POST /api/auth/login - Register or Authenticate Username & Password
router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password, userProfile } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
      return;
    }

    const trimmedUsername = username.trim();
    const inputHash = hashPassword(password.trim());

    let user = await User.findOne({ username: trimmedUsername });

    if (user) {
      // Existing User handling:
      if (!user.passwordHash) {
        // Legacy User Migration: Set the password on first login with password
        user.passwordHash = inputHash;
        if (userProfile) user.userProfile = userProfile;
        await user.save();
        console.log(`[Auth] Legacy user '${trimmedUsername}' initialized password on first login.`);
      } else if (user.passwordHash !== inputHash) {
        // Existing User with set password: Verify password
        res.status(401).json({
          success: false,
          message: `Incorrect password for username '${trimmedUsername}'`,
        });
        return;
      } else if (userProfile && user.userProfile !== userProfile) {
        user.userProfile = userProfile;
        await user.save();
      }
    } else {
      // New User: Register Account with password
      user = await User.create({
        username: trimmedUsername,
        passwordHash: inputHash,
        userProfile: userProfile || 'images/user1.jpg',
        isOnline: false,
        lastSeen: new Date(),
      });
      console.log(`[Auth] Registered new user account '${trimmedUsername}'`);
    }

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        username: user.username,
        userProfile: user.userProfile,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Authentication failed',
    });
  }
});

// GET /api/users - List all registered contacts
router.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).sort({ isOnline: -1, lastSeen: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch registered users',
    });
  }
});

// GET /api/rooms - List all persistent rooms
router.get('/api/rooms', async (_req: Request, res: Response) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch rooms',
    });
  }
});

// GET /api/rooms/user/:username - List rooms joined by a specific user
router.get('/api/rooms/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const rooms = await Room.find({ members: username }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user joined rooms',
    });
  }
});

// GET /api/rooms/:roomId - Get room details and member list
router.get('/api/rooms/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      res.status(404).json({
        success: false,
        message: `Room '${roomId}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch room details',
    });
  }
});

// POST /api/rooms - Create a room once
router.post('/api/rooms', async (req: Request, res: Response) => {
  try {
    const { roomId, name, createdBy } = req.body;

    if (!roomId || !createdBy) {
      res.status(400).json({
        success: false,
        message: 'roomId and createdBy are required fields',
      });
      return;
    }

    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      res.status(409).json({
        success: false,
        message: `Room '${roomId}' already exists`,
        data: existingRoom,
      });
      return;
    }

    const newRoom = await Room.create({
      roomId,
      name: name || roomId,
      createdBy,
      members: [createdBy],
    });

    res.status(201).json({
      success: true,
      data: newRoom,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create room',
    });
  }
});

// DELETE /api/rooms/:roomId - Delete room by owner
router.delete('/api/rooms/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { username } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      res.status(404).json({
        success: false,
        message: `Room '${roomId}' not found`,
      });
      return;
    }

    if (room.createdBy !== username) {
      res.status(403).json({
        success: false,
        message: 'Only the room creator can delete this room',
      });
      return;
    }

    await Room.deleteOne({ roomId });
    await Message.deleteMany({ roomId });

    res.status(200).json({
      success: true,
      message: `Room '${roomId}' and its history deleted successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete room',
    });
  }
});

// GET /api/messages/:roomId - Retrieve room history via REST
router.get('/api/messages/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages.reverse(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages',
    });
  }
});

// GET /api/presence - Get active online users
router.get('/api/presence', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: presenceManager.getAllJoinedUsers(),
  });
});

export default router;
