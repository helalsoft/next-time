import { remindersStorage } from '@/utils/storage';
import { matchesUrl } from '@/utils/matching';
import { t } from '@/utils/i18n';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    let lastAlertedUrl = '';

    const checkAndShowReminders = async () => {
      const currentUrl = window.location.href;
      
      // Prevent duplicate alerts for the same URL (common in SPA navigation events)
      if (currentUrl === lastAlertedUrl) return;

      const reminders = await remindersStorage.getValue();
      const matches: string[] = [];

      for (const reminder of reminders) {
        if (matchesUrl(currentUrl, reminder.url, reminder.matchType)) {
          matches.push(reminder.note);
        }
      }

      if (matches.length > 0) {
        lastAlertedUrl = currentUrl;
        // Use a slight delay to ensure the page is visible before the blocking alert
        setTimeout(() => {
          const message = matches.length === 1 
            ? t('reminder_alert_single', [matches[0]])
            : `${t('reminder_alert_multiple', [matches.length.toString()])}\n\n${matches.map((m, i) => `${i + 1}. ${m}`).join('\n')}`;
          alert(message);
        }, 500);
      }
    };

    // Initial check on page load
    await checkAndShowReminders();

    // Listen for messages from background script about URL changes (SPAs)
    browser.runtime.onMessage.addListener((message: { type: string }) => {
      if (message.type === 'REFRESH_REMINDERS') {
        checkAndShowReminders();
      }
    });
  },
});
