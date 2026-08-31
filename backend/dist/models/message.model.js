import mongoose, { Schema } from 'mongoose';
const chatHistorySchema = new Schema({
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
export const Message = mongoose.model('Message', chatHistorySchema);
export default Message;
