import { io } from 'socket.io-client';
import SERVERURL from "@/app/services/serverURL";  // ✅ correct relative path

let socket = null;

// Use the same base URL
const BACKEND_URL = SERVERURL;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    console.log('🟢 Socket connected to:', BACKEND_URL);
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔴 Socket disconnected');
  }
};