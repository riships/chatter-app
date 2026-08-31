class PresenceManager {
    joinedUsers = new Map();
    addUser(socketId, userDetails) {
        this.joinedUsers.set(socketId, userDetails);
    }
    removeUser(socketId) {
        const user = this.joinedUsers.get(socketId);
        if (user) {
            this.joinedUsers.delete(socketId);
        }
        return user;
    }
    getUserBySocketId(socketId) {
        return this.joinedUsers.get(socketId);
    }
    getAllJoinedUsers() {
        return Array.from(this.joinedUsers.values());
    }
    isUserJoined(username) {
        return Array.from(this.joinedUsers.values()).some((u) => u.user === username);
    }
    getUniqueOnlineUsernames() {
        const usernames = new Set();
        for (const u of this.joinedUsers.values()) {
            if (u.user)
                usernames.add(u.user);
        }
        return Array.from(usernames);
    }
}
export const presenceManager = new PresenceManager();
