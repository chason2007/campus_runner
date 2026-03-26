import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campusrunner.app',
  appName: 'Campus Runner',
  webDir: 'dist',
  ios: {
    scrollEnabled: false,
    allowsLinkPreview: false
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    }
  }
};

export default config;
