import { defineConfig } from 'mspack'
import react from '@mspbots/react'


export default defineConfig({
  publicDir: 'public',
  plugins: [
    react({
      strategy: 'default',
      
      opt: {
        minify: true,
        treeshake: true,
      },
      
      system: {
        app: {
          name: 'MSPBots App',
          title: 'MSPBots React Template',
          icon: 'images/logo.svg',
          favicon: 'favicon.svg',
        },
        auth: {
          enabled: false,
          loginPath: '/apps/mb-platform-user/login',
          redirect: 'redirect',
        },
        theme: {
          primary: '174.4 68.9% 34.2%',
          primaryDark: '173.4 72.7% 41.4%',
          radius: '0.45rem',
        },
        layout: {
          mode: 'vertical',
          collapsible: true,
          defaultCollapsed: false,

          header: {
            enabled:true,
            title: ({ mode }) => mode === 'production' ? '' : '⚡ DEV',
          },

          toolbar: {
            settingsDisabled: true,
            languageDisabled: true,
            fullscreenDisabled: true,
            notificationsDisabled: true,
        
            disabledTooltip: 'Development Environment (DEV) — Data may be test or unstable',
          },
        },
      },
    }),
  ],
  
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
})
