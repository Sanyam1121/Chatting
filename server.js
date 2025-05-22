const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

let users = [];

io.on("connection", (socket) => {
  socket.on("join", ({ username, pfp }) => {
    users[socket.id] = { username, pfp };
    socket.broadcast.emit("chat message", {
      msg: `${username} joined the chat.`,
      username: "System",
      pfp: ""
    });
  });

  socket.on("chat message", (msg) => {
    const user = users[socket.id];
    if (user) {
      io.emit("chat message", { msg, username: user.username, pfp: user.pfp });
    }
  });

  socket.on("typing", (isTyping) => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit("typing", {
        username: user.username,
        isTyping,
      });
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit("chat message", {
        msg: `${user.username} left the chat.`,
        username: "System",
        pfp: ""
      });
      delete users[socket.id];
    }
  });
});

http.listen(3000, () => {
  console.log("Server listening on *:3000");
});
