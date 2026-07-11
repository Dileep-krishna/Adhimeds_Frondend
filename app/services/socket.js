import { io } from 'socket.io-client';
import SERVERURL from "@/app/services/serverURL";

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SERVERURL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};