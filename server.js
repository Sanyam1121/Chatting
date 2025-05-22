const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);

  socket.on("join", ({ username, pfp }) => {
    users[socket.id] = { username, pfp };
    console.log(username + " joined.");
    io.emit("userList", Object.values(users));
  });

  socket.on("chat message", (msg) => {
    // Broadcast message to all except sender
    socket.broadcast.emit("chat message", {
      msg,
      username: users[socket.id]?.username || "Unknown",
      pfp: users[socket.id]?.pfp || "",
    });
  });

  socket.on("typing", (isTyping) => {
    socket.broadcast.emit("typing", {
      username: users[socket.id]?.username || "",
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    delete users[socket.id];
    io.emit("userList", Object.values(users));
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
