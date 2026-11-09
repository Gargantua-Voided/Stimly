
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Automatically detect repository name in GitHub Actions (e.g. /Stimly/ or /repo-name/), and use '/' for AI Studio & local preview
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  let ghPagesBase = '/Stimly/';
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    if (parts.length === 2 && parts[1]) {
      ghPagesBase = `/${parts[1]}/`;
    }
  }
  const base = process.env.VITE_BASE || (isGitHubActions ? ghPagesBase : '/');

  return {
    base,

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'logo.png',
        ],

        manifest: {
          id: base,
          name: 'Stimly · Kinetic Metabolism Monitor',
          short_name: 'Stimly',
          description:
            'Real-time caffeine tracking, metabolism monitoring and sleep impact analysis.',
          theme_color: '#090d16',
          background_color: '#090d16',
          display: 'standalone',
          start_url: base,
          scope: base,

          icons: [
            {
              src: `${base}logo.png`,
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },

        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // Do not modify: AI Studio HMR configuration.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
