import { io } from "socket.io-client";

export const socket = io("http://localhost:3005", {
  autoConnect: false,
  //we need to attach token before connecting
  //we will connect socket once user is authenticated
  //in AuthContext.js
});
