import express from "express";
import myConfig from "./config/configuration.js";
import connectMongoDb from "./config/db.js";
import { createServer } from 'node:http';
import { Server } from "socket.io";
import path from "node:path";
const app = express();

const server = createServer(app);
const io = new Server(server);


connectMongoDb()

app.use(express.static('client'));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

io.on('connection', (socket) => {
    // Listen for 'user' event after the client connects
    socket.on("user", (user) => {
        console.log(user + " connected");
        socket.on('create', function (room) {
            const joinMessage = `${user} has joined the chat`;
            socket.broadcast.in(room).emit('message', { user: 'System', message: joinMessage });

            socket.join(room);

            // Handle message sending
            socket.on("send", (msg) => {
                if (msg) {
                    let msgData = { user: user, message: msg }
                    io.in(room).emit('message', msgData); // Broadcast to all connected clients
                }
            });

            socket.on("sendStatus", (msg) => {
                if (msg == ' ') {
                    socket.to(room).emit('typing', ` `); // Broadcast to all connected clients
                } else {
                    socket.to(room).emit('typing', `<b>${user}:-</b> ${msg}`);
                }
            });

            // Handle client disconnect
            socket.on("disconnect", () => {
                let msgData = { user: user, message: `${user} has disconnected` };

                // Broadcasting the disconnect message to other users in the room
                socket.broadcast.to(room).emit('dis-message', msgData);

                console.log(`${user} disconnected`, msgData);
            });
        });
    });
})

const PORT = myConfig.PORT

server.listen(PORT, (err) => {
    if (!err) {
        console.log(`Server is running on http://localhost:${PORT}`);
    }
})