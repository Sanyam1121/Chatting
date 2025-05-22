const socket = io();

const login = document.querySelector(".login-screen");
const chat = document.querySelector(".chat-screen");

const usernameInput = document.getElementById("username");
const pfpUpload = document.getElementById("pfp-upload");
const pfpPreview = document.getElementById("pfp-preview");
const startBtn = document.getElementById("start-btn");

const userDisplay = document.getElementById("user-display");
const pfpDisplay = document.getElementById("pfp-display");

const messages = document.getElementById("messages");
const typing = document.getElementById("typing");

const form = document.getElementById("form");
const input = document.getElementById("input");

const msgSound = document.getElementById("msg-sound");

let username = "";
let pfp = "";

pfpUpload.addEventListener("change", () => {
  const file = pfpUpload.files[0];
  const reader = new FileReader();
  reader.onload = (e) => pfpPreview.src = e.target.result;
  reader.readAsDataURL(file);
});

startBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  pfp = pfpPreview.src || "";

  if (!username) {
    alert("Enter your name");
    return;
  }

  login.classList.add("hidden");
  chat.classList.remove("hidden");

  userDisplay.textContent = username;
  pfpDisplay.src = pfp;

  socket.emit("join", { username, pfp });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  addMessage(input.value.trim(), "self");
  socket.emit("chat message", input.value.trim());
  input.value = "";
  socket.emit("typing", false);
});

input.addEventListener("input", () => {
  socket.emit("typing", input.value.length > 0);
});

socket.on("chat message", ({ msg, username: uname, pfp }) => {
  const type = uname === username ? "self" : "other";
  addMessage(msg, type);
  msgSound.play();
});

socket.on("typing", ({ username: uname, isTyping }) => {
  typing.textContent = isTyping ? `${uname} is typing...` : "";
});

socket.on("error-full", (msg) => {
  alert(msg);
  location.reload();
});

function addMessage(msg, type) {
  const li = document.createElement("li");
  li.textContent = msg;
  li.classList.add(type);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
