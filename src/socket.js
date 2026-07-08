import { io } from "socket.io-client";

const socket = io("https://mayday-game.onrender.com", {
  transports: ["websocket", "polling"],
});

export default socket;