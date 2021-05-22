const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Om3gle Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('bago user', formatMessage(botName, 'Thank you for joining Om3gle!'));

    // Broadcast when a user connects
    socket.to(user.room).emit('bago user', formatMessage(botName, `${user.username} has joined the chat`)
    );

    socket.emit("user data", user);
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });


  socket.on('typing', function (typing) {
    const user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('typing', typing, { user: typing.username });
  });

  socket.on('typed', function (data) {
    // console.log(data.typed);
    // console.log(data.username);
    io.to(data.to).emit('typed', { typed: data.typed, username: data.username });
    // socket.emit('typed', { from: socket.id, to: data.to, typed: data.typed, user: data.username });
    // // io.sockets.sockets[data.to].emit('typed', { from: socket.id, typed: data.typed, user: data.username, to: data.to });
    // socket.emit('typed', { from: socket.id, typed: data.typed, user: data.username, to: data.to });

  });

  const moment = require('moment');
  socket.on("private", function (data) {
    io.sockets.sockets[data.to].emit("private", { from: socket.id, to: data.to, msg: data.msg, private: data.private, user: data.user, time: moment().format('h:mm a') });
    socket.emit("private", { from: socket.id, to: data.to, msg: data.msg, private: data.private, user: data.user, time: moment().format('h:mm a') });
  });


  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'bago user',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
