import express from "express";
import myConfig from "./config/configuration.js";
import connectMongoDb from "./config/db.js";
import { createServer } from 'node:http';
import { Server } from "socket.io";
import path from "node:path";
import Message from "./chatHistory.model.js";
const app = express();

const server = createServer(app);
const io = new Server(server);


connectMongoDb()

app.use(express.static('client'));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

let joinedUsers = []

io.on('connection', (socket) => {
    // Listen for 'user' event after the client connects
    socket.on("user", (user) => {
        console.log(user + " connected");
        socket.on('create', async function (room) {
            socket.on("img-url", async (imgUrl) => {
                socket.join(room);
                const joinMessage = `${user} has joined the chat`;
                let userDetails = { user_type: 'System', user: user, message: joinMessage, user_profile: imgUrl };
                if (joinedUsers.map(elem => elem.user !== user)) {
                    joinedUsers.push(userDetails);
                }

                // Fetch previous messages from MongoDB and send them to the newly joined user
                try {
                    const previousMessages = await Message.find({}).sort({ timestamp: 1 }).limit(50); // Fetch latest 50 messages
                    socket.emit('loadPreviousMessages', previousMessages);
                } catch (err) {
                    console.error('Error fetching previous messages:', err);
                }

                io.to(room).emit('joined-users-details', joinedUsers);

                socket.broadcast.to(room).emit('message', { userDetails: userDetails });

                // Handle message sending
                socket.on("send", async (msg) => {
                    if (msg) {
                        const storeMessage = new Message({ username: user, text: msg });
                        await storeMessage.save();
                        let userDetails = { user_type: 'User', user: user, message: msg, user_profile: imgUrl };
                        io.in(room).emit('message', { userDetails: userDetails }); // Broadcast to all connected clients
                    }
                });


                socket.on("sendStatus", (msg) => {
                    if (msg === '' || msg === null || msg === undefined) {
                        socket.to(room).emit('typing', null); // Broadcast to all connected clients
                    } else {
                        socket.to(room).emit('typing', `<b>${user}:-</b> ${msg}`);
                    }
                });

                // Handle client disconnect
                socket.on("disconnect", () => {
                    let msgData = { user: user, message: `${user} has disconnected` };
                    let userIndex = joinedUsers.findIndex(joinedUser => joinedUser.user === user);
                    joinedUsers.splice(userIndex, 1);

                    // Broadcasting the disconnect message to other users in the room
                    socket.broadcast.to(room).emit('dis-message', msgData);
                    io.to(room).emit('joined-users-details', joinedUsers);

                    console.log(`${user} disconnected`);
                });
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