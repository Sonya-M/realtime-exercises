import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";
import { Server } from "socket.io";

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

// can create a new socket io server without an http server, but it you pass it one, it will reuse it
// we need to serve static assets as well, so...
const io = new Server(server, {});

io.on('connection', (socket) => {
  console.log(`connected: ${socket.id}`);
  socket.emit('msg:get', { msg: getMsgs() }); // name of event is arbitrary - client needs to listen to that event by that name

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`);
  });

  socket.on('msg:post', (data) => {
    msg.push({
      user: data.user,
      text: data.text,
      time: Date.now()
    });

    // note: not just socket, but io - io represents entire server
    io.emit('msg:get', { msg: getMsgs() }); // send msg to everybody
  })
})

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
