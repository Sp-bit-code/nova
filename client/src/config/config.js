// import { io } from "socket.io-client";

// const URL = "http://localhost:5000";
// // const URL = "https://video-call-server-gm7i.onrender.com";

// export const socket = io(URL);
// export const navbarBrand = "YourVideoShare";


// client/src/config/config.js
import { io } from "socket.io-client";

// Auto-detect environment (local vs production)
const URL =
  process.env.NODE_ENV === "production"
    ? "https://nova-6.onrender.com" 
    : "http://localhost:5000";

export const socket = io(URL, {
  transports: ["websocket"], // force WebSocket (avoids Render long-polling issues)
  withCredentials: true,
});

export const navbarBrand = "YourVideoShare";
