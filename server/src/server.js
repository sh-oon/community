const http = require("http");
const express = require("express");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/rtc/socket-io/",
});

const sessionList = [];

const userListofRoom = {};

const randomId = () => crypto.randomUUID();

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionList[sessionID];
    if (session) {
      socket.sessionID = sessionID;
      socket.username = socket.handshake.auth.userName;
      socket.family = socket.handshake.auth.family;
      return next();
    } else {
      socket.emit("removeSession");
    }
  }
  const family = socket.handshake.auth.family;
  const userName = socket.handshake.auth.userName;
  if (!userName) {
    return next(new Error("invalid username"));
  }
  // create new session
  socket.sessionID = randomId();
  socket.username = userName + Math.floor(Math.random() * 100) // 순서 확인 후 할당식으로 해야할듯 아빠1, 아빠2 이렇게
  socket.family = family === "true";
  next();
});

io.on("connection", (socket) => {
  sessionList[socket.sessionID] = {
    username: socket.username,
    family: socket.family,
    connected: true,
    callWith: '',
  };

  socket.emit("session", {
    sessionID: socket.sessionID,
    username: socket.username,
    family: socket.family,
  });

  socket.emit("createPeer", socket.sessionID);

  socket.on("join", (roomNumber) => {
    socket.join(roomNumber);
    socket.roomID = roomNumber;
    io.in(roomNumber).emit("receiveMsg", "새로운 사용자가 들어왔습니다.");
    // io.to(roomNumber).emit("users");

    
    let members = userListofRoom[roomNumber]
    if (!members) userListofRoom[roomNumber] = [];
    if(userListofRoom[roomNumber].findIndex((member) => member.sessionID === socket.sessionID) === -1){
      let member = {
        sessionID: socket.sessionID,
        username: socket.username,
        family: socket.family,
        connected: true,
        callWith: '',
      };
      userListofRoom[roomNumber].push(member);
    } else if (userListofRoom[roomNumber].findIndex((member) => member.sessionID === socket.sessionID) !== -1) {
      let index = userListofRoom[roomNumber].findIndex((member) => member.sessionID === socket.sessionID)
      userListofRoom[roomNumber][index].username = socket.username
      userListofRoom[roomNumber][index].family = socket.family === 'true'
      userListofRoom[roomNumber][index].connected = true
    }

    io.in(roomNumber).emit("currentMembers", userListofRoom[roomNumber]);
  });

  socket.on("leave", (roomNumber) => {
    socket.leave(roomNumber);
    io.to(roomNumber).emit("receiveMsg", "사용자가 나갔습니다.");
    io.to(roomNumber).emit("users");
  });

  socket.on("hangUp", (data) => {
    let targetIndex = userListofRoom[socket.roomID].findIndex((member) => member.callWith === data.peerID)
    let fromIndex = userListofRoom[socket.roomID].findIndex((member) => member.sessionID === data.peerID)
    userListofRoom[socket.roomID][targetIndex].callWith = '';
    userListofRoom[socket.roomID][fromIndex].callWith = '';

    socket.to(data.room).emit("hangUp", userListofRoom[socket.roomID]);
  });

  socket.on("makingCall", (data) => {
    let targetIndex = userListofRoom[socket.roomID].findIndex((member) => member.sessionID === data.target.sessionID)
    let fromIndex = userListofRoom[socket.roomID].findIndex((member) => member.sessionID === data.from)
    userListofRoom[socket.roomID][targetIndex].callWith = userListofRoom[socket.roomID][fromIndex].sessionID;
    userListofRoom[socket.roomID][fromIndex].callWith = userListofRoom[socket.roomID][targetIndex].sessionID;

    socket.broadcast.to(socket.roomID).emit("currentMembers", userListofRoom[socket.roomID]);
  })

  socket.on("disconnect", () => {
    sessionList[socket.sessionID].connected = false;
    sessionList[socket.sessionID].sessionID = socket.sessionID;
    
    socket.broadcast.to(socket.roomID).emit("user-disconnected", sessionList[socket.sessionID]);

    const exitUser = userListofRoom[socket.roomID].find((member) => member.sessionID === socket.sessionID)
    const index = userListofRoom[socket.roomID].findIndex((member) => member.sessionID === socket.sessionID)
    exitUser.connected = false;
    userListofRoom[socket.roomID][index] = exitUser;

    socket.broadcast.to(socket.roomID).emit("currentMembers", userListofRoom[socket.roomID]);
    socket.broadcast.to(socket.roomID).emit("receiveMsg", `${exitUser.username}님이 나갔습니다.`);
  });

  socket.on("receiveMsg", (msg) => {
    io.to(msg.roomNumber).emit("receiveMsg", {
      sessionID: socket.sessionID,
      message: msg.message,
      username: msg.username,
      roomNumber: msg.roomNumber,
      timeStamp: Date.now(),
    });
  });

  socket.on("location", (location) => {
    userListofRoom[socket.roomID].find((member) => member.sessionID === socket.sessionID).location = location;
    socket.broadcast.to(socket.roomID).emit("location", userListofRoom[socket.roomID]);
  });

  socket.on("initLocation", (location) => {
    userListofRoom[socket.roomID].find((member) => member.sessionID === socket.sessionID).location = location;
    // socket.to(location.roomNumber).emit("location", userListofRoom[socket.roomID]);
    socket.to(socket.roomID).emit("location", userListofRoom[socket.roomID]);
  });

});
io.on("new_namespace", (namespace) => {
  // ...
  console.log(namespace);
});


const port = 4000;
const handleListen = () => console.log(`Listening on ${port} port`);
httpServer.listen(4000, handleListen);

process.on("uncaughtException", (error) => {
  console.log("처리되지 않은 예외 발생", error);
});
