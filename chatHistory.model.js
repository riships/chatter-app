import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
    username: String,
    text: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', chatHistorySchema);
export default Message;