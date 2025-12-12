// ws-handler.ts (or wherever you manage Socket.IO logic)

import { FastifyInstance } from 'fastify';
import { Socket } from 'socket.io';

export const setupSocketIO = (fastify: FastifyInstance) => {

  // This hook ensures the Socket.IO server is ready before we start listening
  fastify.ready(err => {
    if (err) throw err;

    // Listen for new Socket.IO connections
    fastify.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // --- 1. Handling incoming client events ---
      socket.on('client_message', (payload: any) => {
        console.log(`Message from ${socket.id}:`, payload);

        // Emit the event back to the client that sent it
        socket.emit('server_response', `Received your message: ${payload}`);

        // Broadcast to everyone else (optional)
        // socket.broadcast.emit('new_activity', `User ${socket.id} sent a message.`);
      });


      // --- 2. Emitting to all clients on connection ---
      // You can emit an event to ALL connected clients when a new one joins:
      fastify.io.emit('user_joined', { id: socket.id, count: fastify.io.engine.clientsCount });


      // --- 3. Handling disconnection ---
      socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
      });
    });
  });
};
