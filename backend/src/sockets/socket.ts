import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt-access-tokens-12345!';

let io: SocketServer | null = null;

export const initializeSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Allow the client to register their userId to join a unique room
    socket.on('join_room', (data: { userId: string; token?: string }) => {
      if (data.userId) {
        // Option to verify JWT for production security
        if (data.token) {
          try {
            jwt.verify(data.token, JWT_SECRET);
          } catch (err) {
            console.warn(`Unauthenticated socket connection attempt in room registration: ${socket.id}`);
            return;
          }
        }
        socket.join(`user_${data.userId}`);
        console.log(`Socket ${socket.id} joined room user_${data.userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emits an event in real-time to a specific authenticated user
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
    console.log(`Emitted real-time event "${event}" to user_${userId}`);
  } else {
    console.warn(`Socket.IO not initialized. Cannot emit event "${event}" to user_${userId}`);
  }
};
