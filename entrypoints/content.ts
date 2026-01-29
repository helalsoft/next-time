import { remindersStorage } from '@/utils/storage';
import { matchesUrl } from '@/utils/matching';
import { t } from '@/utils/i18n';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const reminders = await remindersStorage.getValue();
    const currentUrl = window.location.href;
    const matches: string[] = [];

    for (const reminder of reminders) {
      if (matchesUrl(currentUrl, reminder.url, reminder.matchType)) {
        matches.push(reminder.note);
      }
    }

    if (matches.length > 0) {
      // Use a slight delay to ensure the page is visible before the blocking alert
      setTimeout(() => {
        const message = matches.length === 1 
          ? t('reminder_alert_single', [matches[0]])
          : `${t('reminder_alert_multiple', [matches.length.toString()])}\n\n${matches.map((m, i) => `${i + 1}. ${m}`).join('\n')}`;
        alert(message);
      }, 500);
    }
  },
});
