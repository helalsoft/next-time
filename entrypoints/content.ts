import { remindersStorage } from '@/utils/storage';
import { matchesUrl } from '@/utils/matching';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const reminders = await remindersStorage.getValue();
    const currentUrl = window.location.href;

    for (const reminder of reminders) {
      if (matchesUrl(currentUrl, reminder.url, reminder.matchType)) {
        // Use a slight delay to ensure the page is visible before the blocking alert
        setTimeout(() => {
          alert(`Reminder: ${reminder.note}`);
        }, 500);
        // Break after first match to avoid multiple alerts, or we could show all.
        // The requirement says "a blocking native alert", usually one is enough.
        break;
      }
    }
  },
});
