import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    homepage_url: 'https://github.com/helalsoft/next-time',
    permissions: ['storage', 'tabs'],
    default_locale: 'en',
    action: {
      default_title: '__MSG_action_title__',
    },
  },
});
