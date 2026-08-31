import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  userProfile?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  userProfile: {
    type: String,
    default: 'images/user1.jpg',
  },
  isOnline: {
    type: Boolean,
    default: false,
    index: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
