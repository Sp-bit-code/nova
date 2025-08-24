// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./App";
// import { VideoCallProvider } from "./context/Context";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "react-toastify/dist/ReactToastify.css";
// import "antd/dist/reset.css";
// import "./index.css";

// ReactDOM.render(
//   <React.StrictMode>
//     <VideoCallProvider>
//       <App />
//     </VideoCallProvider>
//   </React.StrictMode>,
//   document.getElementById("root")
// );

const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors());

// Serve React frontend build
app.use(express.static(path.join(__dirname, "../client/build")));

// API route (optional, for testing)
app.get("/api", (req, res) => {
  res.json({ message: "Server is running" });
});

// Fallback route to serve React for all other paths
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Socket.io logic
io.on("connection", (socket) => {
  socket.emit("socketId", socket.id);

  socket.on("initiateCall", ({ targetId, signalData, senderId, senderName }) => {
    io.to(targetId).emit("incomingCall", {
      signal: signalData,
      from: senderId,
      name: senderName,
    });
  });

  socket.on("changeMediaStatus", ({ mediaType, isActive }) => {
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType,
      isActive,
    });
  });

  socket.on("sendMessage", ({ targetId, message, senderName }) => {
    io.to(targetId).emit("receiveMessage", { message, senderName });
  });

  socket.on("answerCall", (data) => {
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType: data.mediaType,
      isActive: data.mediaStatus,
    });
    io.to(data.to).emit("callAnswered", data);
  });

  socket.on("terminateCall", ({ targetId }) => {
    io.to(targetId).emit("callTerminated");
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
