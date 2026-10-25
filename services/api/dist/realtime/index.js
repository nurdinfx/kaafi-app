"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtime = exports.initRealtime = exports.RealtimeServer = void 0;
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const db_1 = __importDefault(require("../db"));
class RealtimeServer {
    wss;
    userSockets = new Map();
    constructor(server) {
        this.wss = new ws_1.WebSocketServer({ server, path: '/ws' });
        this.initialize();
    }
    initialize() {
        this.wss.on('connection', (ws, req) => {
            // Parse token from query string ?token=...
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token');
            if (token) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_SECRET);
                    ws.userId = decoded.userId;
                    if (!this.userSockets.has(ws.userId)) {
                        this.userSockets.set(ws.userId, new Set());
                    }
                    this.userSockets.get(ws.userId).add(ws);
                    console.log(`[WebSocket] User ${ws.userId} connected.`);
                }
                catch {
                    console.warn('[WebSocket] Connection attempted with invalid token.');
                }
            }
            ws.on('message', async (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.type === 'CHAT_MESSAGE' && ws.userId) {
                        // Save chat message
                        const { conversationId, content, attachmentUrl, offerAttachment } = msg.payload;
                        const chatMsg = await db_1.default.chatMessage.create({
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
                        const participants = await db_1.default.chatParticipant.findMany({
                            where: { conversationId },
                        });
                        participants.forEach((p) => {
                            this.sendToUser(p.userId, 'message.created', chatMsg);
                        });
                    }
                }
                catch (err) {
                    console.error('[WebSocket] Error processing message:', err);
                }
            });
            ws.on('close', () => {
                if (ws.userId && this.userSockets.has(ws.userId)) {
                    this.userSockets.get(ws.userId).delete(ws);
                    if (this.userSockets.get(ws.userId).size === 0) {
                        this.userSockets.delete(ws.userId);
                    }
                }
            });
        });
        console.log('[WebSocket] Realtime WebSocket server initialized on /ws');
    }
    sendToUser(userId, event, payload) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            const data = JSON.stringify({ event, payload, timestamp: new Date() });
            sockets.forEach((ws) => {
                if (ws.readyState === ws_1.WebSocket.OPEN) {
                    ws.send(data);
                }
            });
        }
    }
    broadcast(event, payload) {
        const data = JSON.stringify({ event, payload, timestamp: new Date() });
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}
exports.RealtimeServer = RealtimeServer;
let realtimeInstance = null;
const initRealtime = (server) => {
    realtimeInstance = new RealtimeServer(server);
    return realtimeInstance;
};
exports.initRealtime = initRealtime;
const getRealtime = () => realtimeInstance;
exports.getRealtime = getRealtime;
