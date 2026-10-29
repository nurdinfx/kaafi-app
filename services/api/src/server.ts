import http from 'http';
import createApp from './app';
import { CONFIG } from './config';
import { initRealtime } from './realtime';

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Realtime WebSockets on /ws
  initRealtime(server);

  const port = parseInt(process.env.PORT || String(CONFIG.PORT || 5000), 10);
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
