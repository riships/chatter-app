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

    $("#toggleSidebar").on("click", function () {
        const sidebar = $("#sidebar");
        sidebar.toggleClass("visible");
        sidebar.toggleClass("hidden");
    });


    $("#profilePicContainer").on('click', (event) => {
        $("#popUpImages").show();
        $("#dummyProfileContainer").hide();
    });

    $(".pop-up-image img").click(function () {
        const imgUrl = $(this).attr("src"); // Get the URL of the clicked image
        $("#popUpImages").hide();
        $("#profile-preview").show();
        $("#profile-preview").attr("src", imgUrl);
        // Additional logic can go here (e.g., displaying the image in a larger view)
    });

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
                socket.emit('img-url', $("#profile-preview").attr("src"));
            });

            // Handle connection errors
            socket.on("connect_error", (error) => {
                console.error("Connection failed:", error);
                alert("Unable to connect to the server. Please try again.");
            });

            // Sending a message
            sendMsgBtn.on('click', (event) => {
                event.preventDefault();
                const message = msgInput.val();
                if (message) {
                    socket.emit('send', message);
                    msgInput.val(''); // Clear input field after sending
                }
            });

            // Detect when user is typing
            let typingTimeout;
            msgInput.on('input', () => {
                socket.emit('sendStatus', "Typing...");
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    socket.emit('sendStatus', "");
                }, 1000);
                sendMsgBtn.prop('disabled', !msgInput.val());
            });

            // Handle 'typing' event from server
            socket.on('typing', (msg) => {
                if (msg) {
                    $("#typing-status").show();
                    $("#typing-status").html(msg);
                } else {
                    $("#typing-status").hide();
                }

            });

            // Handle receiving a message
            socket.on('message', (msg) => {
                const currentTime = new Date().toLocaleTimeString(); // Get current time
                const msgDiv = $('<div></div>').addClass(msg.user_type === 'System' ? 'joined-notification' : 'chat-message');

                if (msg.user_type === 'System') {
                    msgDiv.html(`<span class="joined-message">${msg.message}</span><span class="joined-time">${currentTime}</span>`);
                    let joinedUser = `<div class="conversation-item">
                    <img src="/${msg.user_profile}" alt="Contact" class="contact-pic" id="contact-pic_${msg.user}">
                    <div class="conversation-info">
                        <h5>${msg.user}</h5>
                    </div>
                    <span class="time">${currentTime}</span>
                </div>`
                    $("#conversationList").append(joinedUser)
                } else {
                    msgDiv.addClass(msg.user === user ? 'user-message' : 'contact-message');
                    msgDiv.html(`<div class="message-content">
                                    <p><strong>${msg.user}</strong>: ${msg.message}</p>
                                    <span class="timestamp" ${msg.user === user ? 'style = "color:#fff;"' : ''}>${currentTime}</span>
                                  </div>`);

                }

                messagesContainer.append(msgDiv);
                messagesContainer.animate({ scrollTop: messagesContainer[0].scrollHeight }, 500);
            });


            // Handle disconnect event
            socket.on('dis-message', (msgData) => {
                const currentTime = new Date().toLocaleTimeString(); // Get current time
                const msgDiv = $('<div></div>').addClass('joined-notification');
                msgDiv.html(`<span class="leave-message">${msgData.message}</span><span class="joined-time">${currentTime}</span>`);
                $("#messages").append(msgDiv);
            });


            // Allow sending messages with Enter key
            msgInput.on('keypress', function (event) {
                if (event.which === 13 && !event.shiftKey) {
                    event.preventDefault();
                    sendMsgBtn.click();
                }
            });
        } else {
            alert("Please enter both Username and Room ID");
        }
    });
});
