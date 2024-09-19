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
    console.log("New client connected");

    // Listen for 'user' event after the client connects
    socket.on("user", (user) => {
        console.log(`${user} connected`);

        // Handle message sending
        socket.on("send", (msg) => {
            if (msg) {
                socket.broadcast.emit('message', `<b>${user}:-</b> ${msg}`); // Broadcast to all connected clients
            }
        });

        socket.on("sendStatus", (msg) => {
            if (msg == ' ') {
                socket.broadcast.emit('typing', ` `); // Broadcast to all connected clients
            }else{
                socket.broadcast.emit('typing', `<b>${user}:-</b> ${msg}`);
            }
        });

        // Handle client disconnect
        socket.on("disconnect", () => {
            console.log(`${user} disconnected`);
        });
    });
})

const PORT = myConfig.PORT

server.listen(PORT, (err) => {
    if (!err) {
        console.log(`Server is running on http://localhost:${PORT}`);
    }
})