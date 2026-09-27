import http from 'http';
import createApp from './app';
import { CONFIG } from './config';
import { initRealtime } from './realtime';

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Realtime WebSockets on /ws
  initRealtime(server);

  server.listen(CONFIG.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 HUDI-SOFT CANONICAL BACKEND (Fududeeye App)`);
    console.log(`🌐 Server running on http://localhost:${CONFIG.PORT}`);
    console.log(`📡 WebSocket server running on ws://localhost:${CONFIG.PORT}/ws`);
    console.log(`📍 Launch Market: Garoowe, Puntland, Somalia`);
    console.log(`====================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
