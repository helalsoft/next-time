import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: '__MSG_extension_name__',
    homepage_url: 'https://github.com/helalsoft/next-time',
    permissions: ['storage', 'tabs', 'contextMenus'],
    default_locale: 'en',
    action: {
      default_title: '__MSG_action_title__',
    },
  },
  runner: {
    startUrls: [
      'https://www.hepsiburada.com',
      'https://www.migros.com.tr',
      'https://www.google.com'
    ],
  },
});
