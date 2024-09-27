$(document).ready(function () {
    // Initialize Socket.IO connection variable
    let socket;

    // DOM Elements
    const userStatus = $("#userStatus");
    const msgInput = $("#msgInput")
    const sendMsgBtn = $("#sendMsg")
    const messagesContainer = $("#messages")
    const user = $("#username").val()
    const getRoom = $("#roomid")
    const loginPage = $("#loginPage");
    const chatDashboard = $("#chatDashboard");

    // Connect button click event

    socket = io();  // Connect to the server

    if (user && getRoom) {
        loginPage.hide();
        chatDashboard.show();
        // When connected
        socket.on("connect", () => {
            console.log("Connected to server");
            console.log(user);
            userStatus.text(`${user} Connected to server`);
            socket.emit('user', user)
            socket.emit('create', getRoom);
        });


        sendMsgBtn.on('click', (event) => {
            event.preventDefault()
            if (msgInput.val()) {
                socket.emit('send', msgInput.val())
                msgInput.val('')
                socket.emit('sendStatus', " ");
            }
        })
        msgInput.on('focus', (event) => {
            event.preventDefault()
            socket.emit('sendStatus', "Typing...")
        })

        socket.on('typing', (msg) => {
            if (msg) {
                $("#statusOfuser").html(msg)
            }
        })
        socket.on('message', (msg) => {
            if (msg) {
                let msgP = $('<p></p>');
                msgP.html(msg)
                messagesContainer.append(msgP)
            }
        })
    }else{
        alert("Kindly insert Username and RoomId")
    }

});