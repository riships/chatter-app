# Chatter & Co. — Real-Time Bespoke Messaging Platform

A high-performance, full-stack real-time chat application built with **Node.js, Express, TypeScript, Socket.IO, MongoDB, React 18, and Vite**. Features client-side **AES-256 End-to-End Encryption (E2EE)**, **SHA-256 Password Authentication**, **WhatsApp/Slack-Style Directory**, and **Multi-Theme Customization**.

---

## 🏗️ System Architecture Overview

```
                          ┌───────────────────────────┐
                          │   React 18 + Vite + TS    │
                          │   Frontend (Port 5173)    │
                          └─────────────┬─────────────┘
                                        │
                         HTTP REST / WebSockets (E2EE)
                                        │
                          ┌─────────────▼─────────────┐
                          │   Express + TS Backend    │
                          │   Socket.IO (Port 3000)   │
                          └─────────────┬─────────────┘
                                        │
                               Mongoose ORM
                                        │
                          ┌─────────────▼─────────────┐
                          │     MongoDB Database      │
                          │ (Users, Rooms, Messages)  │
                          └───────────────────────────┘
```

---

## ⚙️ Configuration & Environment Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

---

### 2. Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Backend Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_URI=mongodb://localhost:27017/chatter-db

# Frontend CORS Origin
CLIENT_ORIGIN=http://localhost:5173
```

---

### 3. Installation & Local Execution

#### Step A: Start Backend Server (`backend/`)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run TypeScript development server
npm run dev

# (Optional) Build production bundle
npm run build
```
*Backend runs on `http://localhost:3000`.*

#### Step B: Start Frontend Application (`client/`)
```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# (Optional) Build production bundle
npm run build
```
*Frontend runs on `http://localhost:5173`.*

---

## 📡 API Reference & Socket Events

### REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate or register username with password hash |
| `GET` | `/api/users` | Retrieve all registered contacts directory |
| `GET` | `/api/rooms` | Retrieve all persistent group rooms |
| `GET` | `/api/rooms/user/:username` | Retrieve groups joined by a specific user |
| `GET` | `/api/rooms/:roomId` | Get group room metadata and member roster |
| `POST` | `/api/rooms` | Create a new group room |
| `DELETE` | `/api/rooms/:roomId` | Delete a group room (Admin only) |
| `GET` | `/api/messages/:roomId` | Retrieve historical message log for room |
| `GET` | `/api/presence` | Fetch online active presence list |
| `GET` | `/health` | Server uptime and health check |

---

### Key Socket.IO Events

- `user`: Register active socket presence and login user
- `send` / `send-direct`: Emit client-side encrypted AES-256 message payload
- `update-group-info`: Edit Group Name and Description
- `remove-group-member`: Admin kick group member
- `leave-group-room`: Remove self from group membership
- `delete-group-room`: Permanently erase group room and message history

---

## 📄 Project Documentation

For a comprehensive feature showcase, see [**`FEATURES.md`**](file:///d:/chatter-app/FEATURES.md).
