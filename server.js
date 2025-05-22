const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = [];

io.on("connection", socket => {
  socket.on("join", ({ username, pfp }) => {
    if (users.length >= 2) return;
    users.push({ id: socket.id, username, pfp });
    socket.broadcast.emit("user-joined", { username, pfp });
  });

  socket.on("message", data => {
    socket.broadcast.emit("message", data);
  });

  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id);
    socket.broadcast.emit("user-left");
  });
});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
