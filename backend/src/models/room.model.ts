import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    required: true,
  },
  members: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Room = mongoose.model<IRoom>('Room', roomSchema);
export default Room;
