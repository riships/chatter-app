# Chatter & Co. — Detailed Features Catalog

This document provides an in-depth breakdown of all technical, visual, and architectural features implemented in **Chatter & Co.**

---

## 🔒 1. Security & Privacy Features

### Client-Side AES-256 End-to-End Encryption (E2EE)
- **Zero-Knowledge Cipher Transmission**: All direct messages and group room messages are encrypted on the client side using **AES-256** prior to transmission.
- **Server Privacy**: MongoDB and WebSockets only store/transfer encrypted ciphertexts (`[ENC:AES-256]...`).
- **Real-Time Decryption**: Recipient browsers decrypt messages in real time.
- **Security Badge**: The header and message bubbles feature a `🔒 AES-256 Encrypted` indicator.

### SHA-256 Password Authentication & Impersonation Protection
- **Account Protection**: Every username is bound to a SHA-256 password hash in MongoDB.
- **Legacy Migration**: Existing user accounts automatically initialize their password on first login.
- **Impersonation Prevention**: Login attempts with incorrect passwords are rejected with explicit HTTP 401 error alerts.

---

## 🎨 2. Design System & Customization

### Multi-Theme Customizer System
Click the **Palette** icon in the header to instantly switch between four curated HSL color themes:
1. 🟣 **Cyberpunk Violet**: Neon purple & violet glass (Default).
2. 🟢 **Emerald Aurora**: Deep obsidian with glowing emerald green (`#059669`) & mint accents.
3. 🔴 **Sunset Crimson**: Dark rose pink (`#e11d48`) & warm sunset gradients.
4. 🔵 **Oceanic Deep**: Deep space indigo blue (`#2563eb`) & electric cyan.
- *Selections persist across sessions via `localStorage`.*

### Custom Profile Photo Uploads & Canvas Compression
- Users can pick from preset avatars OR upload any custom image file (`.jpg`, `.png`, `.webp`) from their computer.
- Uploaded photos are compressed using HTML5 Canvas to $200 \times 200$ px Data URLs for optimal performance.

---

## 💬 3. Messaging & Group Features

### WhatsApp / Slack Style Contacts Directory
- **Direct Contacts Roster**: Displays registered users with real-time **● Online** (green badge) or **Offline - Last seen at [time]** badges.
- **Self Exclusion**: The contacts count and list strictly exclude the logged-in user.

### 1-on-1 Direct Messaging
- **Deterministic Private Channel Keys**: Computes sorting key `[userA, userB].sort().join('_direct_')` so both parties seamlessly connect to the same private stream.

### Persistent Joined Groups Roster
- **Persistent Membership**: Users remain persistent members (`Room.members`) of joined groups.
- **Group Filter Tabs**: Filter sidebar items by *All*, *DMs*, or *Groups*.

### Group Info & Admin Controls
- **Admin Creator Badge**: Prominently highlights the group creator with a `👑 Admin` badge.
- **Edit Group Info**: Group Admin can edit the Group Name and Description inline.
- **Remove Member (Kick)**: Admin can kick non-admin members from the group.
- **Delete Group**: Admin can permanently delete the room and chat history for all members.

---

## 🔔 4. Notifications & Audio Polish

- **Glassmorphic In-App Toast Popups**: Floating top-right banner for unread incoming messages with quick-reply click action.
- **Unread Counter Badges**: Vibrant count pills on sidebar items.
- **Web Audio API Sound Synthesizer**: Soft audio pop feedback on sending messages and dual-tone notification chime on incoming messages.
- **Browser Desktop Notifications**: Native desktop alerts when tab is blurred or minimized.

---

## 💾 5. Session Management & Presence Reliability

- **Persistent Sessions Across Refreshes**: Browser refresh (F5) automatically restores login session and WebSockets without asking for password re-entry.
- **Server Startup Presence Cleanup**: Resets stale online flags on server startup.
- **Periodic Presence Sanitizer**: Background cleanup every 15 seconds cleans orphaned socket states.
- **Multi-Tab Safety**: Disconnecting one tab does not mark a user offline if other tabs remain open.

---

## 🚀 6. System Architecture for 2 Million Users

Designed with a scalable cloud-native blueprint:
- **Stateless WebSocket Gateways**: Horizontal scaling using AWS NLB.
- **Redis Pub/Sub Adapter**: `@socket.io/redis-adapter` for cross-node event broadcasting.
- **Redis Presence Cache**: In-memory O(1) active user tracking.
- **Kafka Event Streaming**: Async message ingestion queue.
- **Sharded MongoDB / Cassandra**: Horizontal partition key by `roomId` and `timestamp`.
