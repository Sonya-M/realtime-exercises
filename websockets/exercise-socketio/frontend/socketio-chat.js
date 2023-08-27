// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// connect and upgrade to ws
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('connected');
  presence.innerText = '🟢'
});

socket.on('disconnect', () => {
  console.log('disconnected');
  presence.innerText = '🔴'
});

socket.on('msg:get', (data) => {
  allChat = data.msg;
  render();
})
// socketio will try to reconnect if the server goes down and then restarts, but you can turn off the option to retry connections
// also if browser doesn't support ws, will try polling - you can test that by setting window.WebSocket = null

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = { user, text };
  socket.emit('msg:post', data)
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
