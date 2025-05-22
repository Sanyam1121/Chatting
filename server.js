const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let users = {};

io.on('connection', socket => {
  if (Object.keys(users).length >= 2) {
    // Room full, disconnect
    socket.emit('room full');
    socket.disconnect();
    return;
  }

  socket.on('join', ({ username, pfp }) => {
    users[socket.id] = { username, pfp };
    io.emit('user list', Object.values(users));
    io.emit('online status', Object.values(users).length === 2 ? 'Online' : 'Waiting for other user...');
  });

  socket.on('chat message', ({ msg, username, pfp }) => {
    io.emit('chat message', {
      msg,
      username,
      pfp,
      time: new Date().toISOString()
    });
  });

  socket.on('typing', ({ username }) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user list', Object.values(users));
    io.emit('online status', Object.values(users).length === 2 ? 'Online' : 'Waiting for other user...');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
