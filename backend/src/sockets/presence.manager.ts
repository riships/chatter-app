import { UserDetails } from '../types/chat.types.js';

class PresenceManager {
  private joinedUsers: Map<string, UserDetails> = new Map();

  public addUser(socketId: string, userDetails: UserDetails): void {
    this.joinedUsers.set(socketId, userDetails);
  }

  public removeUser(socketId: string): UserDetails | undefined {
    const user = this.joinedUsers.get(socketId);
    if (user) {
      this.joinedUsers.delete(socketId);
    }
    return user;
  }

  public getUserBySocketId(socketId: string): UserDetails | undefined {
    return this.joinedUsers.get(socketId);
  }

  public getAllJoinedUsers(): UserDetails[] {
    return Array.from(this.joinedUsers.values());
  }

  public isUserJoined(username: string): boolean {
    return Array.from(this.joinedUsers.values()).some((u) => u.user === username);
  }

  public getUniqueOnlineUsernames(): string[] {
    const usernames = new Set<string>();
    for (const u of this.joinedUsers.values()) {
      if (u.user) usernames.add(u.user);
    }
    return Array.from(usernames);
  }
}

export const presenceManager = new PresenceManager();
