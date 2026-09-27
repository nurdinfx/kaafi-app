import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';
import prisma from '../db';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class RealtimeServer {
  private wss: WebSocketServer;
  private userSockets: Map<string, Set<AuthenticatedSocket>> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: AuthenticatedSocket, req) => {
      // Parse token from query string ?token=...
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (token) {
        try {
          const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as { userId: string };
          ws.userId = decoded.userId;

          if (!this.userSockets.has(ws.userId)) {
            this.userSockets.set(ws.userId, new Set());
          }
          this.userSockets.get(ws.userId)!.add(ws);
          console.log(`[WebSocket] User ${ws.userId} connected.`);
        } catch {
          console.warn('[WebSocket] Connection attempted with invalid token.');
        }
      }

      ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'CHAT_MESSAGE' && ws.userId) {
            // Save chat message
            const { conversationId, content, attachmentUrl, offerAttachment } = msg.payload;
            const chatMsg = await prisma.chatMessage.create({
              data: {
                conversationId,
                senderId: ws.userId,
                content,
                attachmentUrl: attachmentUrl || null,
                offerAttachment: offerAttachment ? JSON.stringify(offerAttachment) : null,
              },
              include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
            });

            // Broadcast to participants
            const participants = await prisma.chatParticipant.findMany({
              where: { conversationId },
            });

            participants.forEach((p) => {
              this.sendToUser(p.userId, 'message.created', chatMsg);
            });
          }
        } catch (err) {
          console.error('[WebSocket] Error processing message:', err);
        }
      });

      ws.on('close', () => {
        if (ws.userId && this.userSockets.has(ws.userId)) {
          this.userSockets.get(ws.userId)!.delete(ws);
          if (this.userSockets.get(ws.userId)!.size === 0) {
            this.userSockets.delete(ws.userId);
          }
        }
      });
    });

    console.log('[WebSocket] Realtime WebSocket server initialized on /ws');
  }

  public sendToUser(userId: string, event: string, payload: any): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const data = JSON.stringify({ event, payload, timestamp: new Date() });
      sockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    }
  }

  public broadcast(event: string, payload: any): void {
    const data = JSON.stringify({ event, payload, timestamp: new Date() });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

let realtimeInstance: RealtimeServer | null = null;

export const initRealtime = (server: HttpServer): RealtimeServer => {
  realtimeInstance = new RealtimeServer(server);
  return realtimeInstance;
};

export const getRealtime = (): RealtimeServer | null => realtimeInstance;
