$(document).ready(function () {
    // Initialize Socket.IO connection variable
    let socket;

    // DOM Elements
    const userStatus = $("#userStatus");
    const msgInput = $("#msgInput");
    const sendMsgBtn = $("#sendMsg");
    const messagesContainer = $("#messages");
    const loginPage = $("#loginPage");
    const chatDashboard = $("#chatDashboard");
    const userDetailName = $("#userDetailName");

    // Connect button click event
    $("form").on("submit", function (event) {
        event.preventDefault(); // Prevent form from submitting

        const user = $("#username").val();
        const roomId = $("#roomid").val();

        if (user && roomId) {
            // Hide login page and show chat dashboard
            loginPage.hide();
            chatDashboard.show();

            // Connect to the server
            socket = io();

            // When connected
            socket.on("connect", () => {
                userStatus.text(`Online`);
                userDetailName.text(user)
                // Emit user and room information to server
                socket.emit('user', user);
                socket.emit('create', roomId);
            });

            // Sending a message
            sendMsgBtn.on('click', (event) => {
                event.preventDefault();
                const message = msgInput.val();
                if (message) {
                    socket.emit('send', message);
                    msgInput.val(''); // Clear input field after sending
                    socket.emit('sendStatus', " "); // Clear typing status
                }
            });

            // Detect when user is typing
            msgInput.on('focus', (event) => {
                socket.emit('sendStatus', "Typing...");
            });

            // Handle 'typing' event from server
            socket.on('typing', (msg) => {
                if (msg) {
                    $("#statusOfuser").html(msg);
                }
            });

            // Handle receiving a message
            socket.on('message', (msg) => {
                const currentTime = new Date().toLocaleTimeString(); // Get current time
                if (msg.user === 'System') {
                    const msgDiv = $('<div></div>').addClass('joined-notification');

                    // Format message with time
                    msgDiv.html(`<span class="joined-message">${msg.message}</span><span class="joined-time">${currentTime}</span>`);
                    messagesContainer.append(msgDiv[0]);
                } else {
                    const msgDiv = $('<div></div>');
                    if (msg.user === user) {
                        msgDiv.addClass('chat-message user-message');
                    } else {
                        msgDiv.addClass('chat-message contact-message');
                    }
                    msgDiv.html(`<div class="message-content">
                                    <p><strong>${msg.user}</strong>: ${msg.message}</p>
                                    <span class="timestamp">${currentTime}</span>
                                </div>`)
                    messagesContainer.append(msgDiv);
                }
            });
        } else {
            alert("Please enter both Username and Room ID");
        }
    });
});
