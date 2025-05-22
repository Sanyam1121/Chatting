const socket = io();

const login = document.getElementById("login");
const chat = document.getElementById("chat");

const usernameInput = document.getElementById("username");
const pfpUpload = document.getElementById("pfp-upload");
const pfpPreview = document.getElementById("pfp-preview");
const startBtn = document.getElementById("start-btn");

const userDisplay = document.getElementById("user-display");
const pfpDisplay = document.getElementById("pfp-display");

const messages = document.getElementById("messages");
const typingDiv = document.getElementById("typing");

const form = document.getElementById("form");
const input = document.getElementById("input");

const msgSound = document.getElementById("msg-sound");

let username = "";
let pfp = "";
let typingTimeout;

// Preview uploaded image
pfpUpload.addEventListener("change", () => {
  const file = pfpUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      pfpPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

startBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  pfp = pfpPreview.src;

  if (!username) {
    alert("Please enter your name!");
    return;
  }

  // Hide login, show chat
  login.classList.add("hidden");
  chat.classList.remove("hidden");

  userDisplay.textContent = username;
  pfpDisplay.src = pfp;

  // Notify server
  socket.emit("join", { username, pfp });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() === "") return;

  // Add message to UI as self
  addMessage(input.value.trim(), "self", pfp);

  // Send message to server
  socket.emit("chat message", input.value.trim());

  input.value = "";
  socket.emit("typing", false);
});

input.addEventListener("input", () => {
  socket.emit("typing", input.value.length > 0);
});

socket.on("chat message", ({ msg, username: otherUsername, pfp: otherPfp }) => {
  addMessage(msg, "other", otherPfp);
  msgSound.play();
});

socket.on("typing", ({ username: otherUsername, isTyping }) => {
  if (isTyping) {
    typingDiv.textContent = `${otherUsername} is typing...`;
  } else {
    typingDiv.textContent = "";
  }
});

function addMessage(msg, type, pfpUrl) {
  const li = document.createElement("li");
  li.textContent = msg;
  li.classList.add(type);

  // Add profile pic bubble
  const img = document.createElement("img");
  img.src = pfpUrl;
  img.classList.add("msg-pfp");

  li.appendChild(img);
  messages.appendChild(li);

  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
}
