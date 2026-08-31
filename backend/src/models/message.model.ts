import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId?: string;
  username: string;
  text: string;
  userProfile?: string;
  isDirect?: boolean;
  recipient?: string;
  timestamp: Date;
}

const chatHistorySchema = new Schema<IMessage>({
  roomId: {
    type: String,
    default: 'default-room',
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userProfile: {
    type: String,
  },
  isDirect: {
    type: Boolean,
    default: false,
    index: true,
  },
  recipient: {
    type: String,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound Index for scalable room/direct history queries
chatHistorySchema.index({ roomId: 1, timestamp: -1 });

export const Message = mongoose.model<IMessage>('Message', chatHistorySchema);
export default Message;
