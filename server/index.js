// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const socketIO = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// const PORT = process.env.PORT || 5000;

// app.use(cors());

// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// io.on("connection", (socket) => {
//   socket.emit("socketId", socket.id);

//   socket.on(
//     "initiateCall",
//     ({ targetId, signalData, senderId, senderName }) => {
//       io.to(targetId).emit("incomingCall", {
//         signal: signalData,
//         from: senderId,
//         name: senderName,
//       });
//     }
//   );

//   socket.on("changeMediaStatus", ({ mediaType, isActive }) => {
//     socket.broadcast.emit("mediaStatusChanged", {
//       mediaType,
//       isActive,
//     });
//   });

//   socket.on("sendMessage", ({ targetId, message, senderName }) => {
//     io.to(targetId).emit("receiveMessage", { message, senderName });
//   });

//   socket.on("answerCall", (data) => {
//     socket.broadcast.emit("mediaStatusChanged", {
//       mediaType: data.mediaType,
//       isActive: data.mediaStatus,
//     });
//     io.to(data.to).emit("callAnswered", data);
//   });

//   socket.on("terminateCall", ({ targetId }) => {
//     io.to(targetId).emit("callTerminated");
//   });
// });

// server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://nova-6.onrender.com"
    ],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// CORS middleware
app.use(cors());

// Serve React frontend build if it exists
const buildPath = path.join(__dirname, "../client/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // Fallback route to serve React for all other paths
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.warn("⚠️ React build not found. Frontend will not be served.");
}

// Optional API route
app.get("/api", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  socket.emit("socketId", socket.id);

  socket.on("initiateCall", ({ targetId, signalData, senderId, senderName }) => {
    io.to(targetId).emit("incomingCall", {
      signal: signalData,
      from: senderId,
      name: senderName,
    });
  });

  socket.on("changeMediaStatus", ({ mediaType, isActive }) => {
    socket.broadcast.emit("mediaStatusChanged", { mediaType, isActive });
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

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
