import { io } from "socket.io-client"
import { socketUri } from "../config/config";

let socket;

function initConnection(roomNumber = 1, name, family = false) {
  let localSessionID = localStorage.sessionID;
  // const sessionID = localStorage.sessionID || "ee0c8bde-1da7-4d31-a445-d670d89fa38c";
  socket = io(socketUri, {
    path: "/",
    auth: {
      sessionID: localSessionID ?? null,
      userName: name,
      family: family,
    },
  });

  socket.on("connect", () => {
    socket.emit("join", roomNumber);
  });

  socket.on("receiveMsg", (data) => {
    console.log("receive message");
    console.log(data);
  });

  socket.on("session", ({ sessionID, username, family }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID, username, family };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    localSessionID = sessionID;
  });

  socket.on("user-disconnected", (data) => {
    console.log("user-disconnected");
  });

  socket.on("initLocation", (members) => {
 
    console.log("initLocation");
  });

  socket.on("removeSession", () => {
    console.log("세션 삭제");
    localStorage.removeItem("sessionID");
  });

  socket.on("currentMembers", (members) => {

  });

}

export {
  initConnection
}