const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const privateRoom = document.querySelector('.privateRoom')
let myID = "";
let private = false;
let privateName = "";
let privateUser = "";
var divs = "";
var hidetype = $('#typingMes');
var hidetype1 = $('.typo');
var hidePriv = $('.typingMessages');
var hidePri = $('.typose');
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

console.log(username, room);

const socket = io();

var timeout;

function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
}

$('.input').keyup(function () {
    typing = true;
    socket.emit('typing', { typing: typing, user: username });
    console.log('happening');
    // console.log(username);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 1000);
});


socket.on('typing', function (data) {
    console.log(data);
    if (data) {
        $('.typingMes').show().delay(300).fadeOut();
        // console.log(data.user);
        $('.typo').html('&nbsp;' + data.user + ' is typing...').show().delay(300).fadeOut();

    } else {
        $('.typing').text("");
    }
});


function timeoutFunctions() {
    typed = false;
    socket.emit("typed", false);
}

$('#msg').keyup(function () {
    typed = true;
    console.log(typed);
    socket.emit('typed', { typed: typed, username: username, to: privateUser, from: username });
    console.log('happening');
    // console.log(username);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunctions, 1000);
});


socket.on('typed', function (typed) {
    console.log(typed.username);
    console.log(typed.typed);
    if (typed.typed) {
        console.log(typed.username);
        $('.typingMessages').show().delay(300).fadeOut();
        // console.log(data.user);
        $('.typose').html('&nbsp;' + typed.username + ' is typing...').show().delay(300).fadeOut();
    } else {
        $('.typing').text("");
    }
});



socket.on("user data", (data) => {
    myID = data.id;
    console.log("My id is " + myID)
})

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});


// Message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('bago user', (message) => {
    $('.chat-messages').append(` 
    <p class="small text-center">${message.text}</p>
  `)
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    if (private) {
        socket.emit("private", {
            private: privateName,
            user: username,
            msg: msg,
            to: privateUser,
            from: username
        });
    } else {
        socket.emit('chatMessage', msg);
    }
    $(".message").val("");
    $(".message").focus();

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Emit message to server


    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

socket.on("private", function (data) {
    // console.log(private);
    // console.log(data);
    // console.log(data.to);
    // console.log(data.from);
    console.log(data.msg);
    // console.log(data.private);
    // console.log(data.user);
    // console.log(data.time);

    if (private == true) {
        $('#typingMes').detach('');
        $('.typo').detach('');
        if (data.user == username) {
            $('.privateRoom').append(`<div><small class='type' href=''>${data.user}&nbsp;<span class='text-success'>${data.time}</span></small> <div class="you">
            <p class="text">${data.msg}</p>
          </div></div>`);
        } else {
            $('.privateRoom').append(`<a class='other' href='index.html' style='text-decoration:none;color:black;font-size:small;' data-toggle="tooltip" data-html="true" title="Click here for private message"">${data.user}&nbsp;<span class='text-success'>${data.time}</span></a> <div class="others mt-1">
            <p class="text1">${data.msg}</p>
          </div>`);
        }
    } else {
        $('.roomPri').prepend(hidetype);
        $('.roomPri').prepend(hidetype1);
        if (data.user === username) {
            $('.privateRoom').append(`<small class='type' href=''>${data.user}&nbsp;<span class='text-success'>${data.time}</span></small> <div class="you">
            <p class="text">${data.msg}</p>
          </div>`);
        } else {
            $('.privateRoom').append(`<a class='other' href='index.html' style='text-decoration:none;color:black;font-size:small;' data-toggle="tooltip" data-html="true" title="Click here for private message"">${data.user}&nbsp;<span class='text-success'>${data.time}</span></a> <div class="others mt-1">
            <p class="text1">${data.msg}</p>
          </div>`);
        }
    }
    privateRoom.scrollTop = privateRoom.scrollHeight;
});



// Output message to DOM
function outputMessage(message) {

    var user = message.username;
    if (user == username) {
        $('.chat-messages').append(` <small class='type' href=''>${message.username}&nbsp;<span class='text-success'>${message.time}</span></small> <div class="you">
    <p class="text">${message.text}</p>
  </div>`)
    } else {
        $('.chat-messages').append(` <a class='other' href='index.html' style='text-decoration:none;color:black;font-size:small;' data-toggle="tooltip" data-html="true" title="Click here for private message"">${message.username}&nbsp;<span class='text-success'>${message.time}</span></a> <div class="others mt-1">
    <p class="text1">${message.text}</p>
  </div>`)
    }

}


// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}


// Add users to DOM
function outputUsers(users) {
    $('#users').empty()
    users.forEach((user) => {
        const stats = `&nbsp;&nbsp;<span><img src='https://i.ibb.co/nkBzrPF/removal-ai-tmp-609cb7c64018a.png' width='10' ></span>`;
        if (user.username == username) {
            $('.IUser').html(`<span><img src="https://64.media.tumblr.com/594bf64e39c4c243c32674b10690288a/tumblr_ou6if2Px3P1vi7fh5o1_1280.jpg" alt="" class="rounded-circle" width="50"></span>&nbsp;<span class="p-2 text-dark mt-2" user-name="${user.username}" user-id="${user.id}" style="border-radius:5rem;width:fit-content;background-color:white;"><small class='text-muted'></small>&nbsp;${user.username}${stats}</span>`);
        } else {
            $('#users').append(`<li class="p-2 mt-2 private-user" user-name="${user.username}" user-id="${user.id}" style="border-radius:5rem;width:fit-content;background-color:#f56c9e;"><i class="fas fa-user-friends"></i><input type='hidden' id='idOther' value='${user.id}'>&nbsp;<button id='btn-fr' class='btn-fr'>${user.username}${stats}</button></li>`);
        }
    });
}


console.log(private);

$("#users").on("click", ".private-user", function () {
    privateName = $(this).attr("user-name");
    privateUser = $(this).attr("user-id");
    console.log(privateUser);

    private = true;
    showPrivateCard()
    console.log(private);
    $(".room-username").html($(this).attr("user-name"));

});


function showPrivateCard() {
    var x = document.getElementById("private-card");
    if (x.style.display === "none") {
        x.style.display = "block";
        // $('.privateRoom').empty();
        private = true;
        $('#typingMes').detach('');
        $('.typo').detach('');
        $('.privv').prepend(hidePriv);
        $('.privv').prepend(hidePri);

    } else {
        x.style.display = "none";
        // $('.privateRoom').empty();
        private = false;
        $('.roomPri').prepend(hidetype);
        $('.roomPri').prepend(hidetype1);
        $('.typingMessages').detach('');
        $('.typose').detach('');
    }
}


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to migrate?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else { }
});