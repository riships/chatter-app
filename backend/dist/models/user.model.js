import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
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
export const User = mongoose.model('User', userSchema);
export default User;
