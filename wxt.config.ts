import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    homepage_url: 'https://github.com/helalsoft/next-time',
    permissions: ['storage', 'tabs'],
  },
});
