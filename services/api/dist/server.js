"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const realtime_1 = require("./realtime");
const startServer = async () => {
    const app = (0, app_1.default)();
    const server = http_1.default.createServer(app);
    // Initialize Realtime WebSockets on /ws
    (0, realtime_1.initRealtime)(server);
    const port = parseInt(process.env.PORT || String(config_1.CONFIG.PORT || 5000), 10);
    const host = '0.0.0.0';
    server.listen(port, host, () => {
        console.log(`====================================================`);
        console.log(`🚀 HUDI-SOFT CANONICAL BACKEND (Fududeeye App)`);
        console.log(`🌐 Server running on http://${host}:${port}`);
        console.log(`📡 WebSocket server running on ws://${host}:${port}/ws`);
        console.log(`📍 Launch Market: Garoowe, Puntland, Somalia`);
        console.log(`====================================================`);
    });
};
startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
});
