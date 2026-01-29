import { remindersStorage } from '@/utils/storage';
import { matchesUrl } from '@/utils/matching';

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
          ? `Reminder: ${matches[0]}`
          : `You have ${matches.length} reminders:\n\n${matches.map((m, i) => `${i + 1}. ${m}`).join('\n')}`;
        alert(message);
      }, 500);
    }
  },
});
