import mongoose, { Schema } from 'mongoose';
const roomSchema = new Schema({
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
export const Room = mongoose.model('Room', roomSchema);
export default Room;
