import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fududeeye.app',
  appName: 'Fududeeye',
  webDir: 'out',
  server: {
    // 10.0.2.2 is localhost on Android Emulator
    // Connects directly to the running Next.js dev server on port 3000
    url: 'http://10.0.2.2:3000',
    cleartext: true
  }
};

export default config;
