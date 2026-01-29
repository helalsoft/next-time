import { remindersStorage } from '@/utils/storage';
import { matchesUrl } from '@/utils/matching';
import { t } from '@/utils/i18n';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main(ctx) {
    let lastAlertedUrl = '';
    let ui: any = null;

    const showModal = async (matches: string[]) => {
      if (ui) ui.remove();

      ui = await createShadowRootUi(ctx, {
        name: 'next-time-modal',
        position: 'modal',
        zIndex: 2147483647,
        onMount: (container) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'nt-modal-wrapper';
          
          const modal = document.createElement('div');
          modal.className = 'nt-modal';
          
          const header = document.createElement('div');
          header.className = 'nt-header';
          
          const title = document.createElement('span');
          title.className = 'nt-title';
          title.textContent = matches.length === 1 ? t('extension_name') : t('reminder_alert_multiple', [matches.length.toString()]);
          
          const closeBtn = document.createElement('button');
          closeBtn.className = 'nt-close';
          closeBtn.innerHTML = '&times;';
          closeBtn.onclick = () => ui.remove();
          
          header.appendChild(title);
          header.appendChild(closeBtn);
          
          const content = document.createElement('div');
          content.className = 'nt-content';
          
          if (matches.length === 1) {
            const p = document.createElement('p');
            p.textContent = matches[0];
            content.appendChild(p);
          } else {
            const ul = document.createElement('ul');
            matches.forEach(m => {
              const li = document.createElement('li');
              li.textContent = m;
              ul.appendChild(li);
            });
            content.appendChild(ul);
          }
          
          modal.appendChild(header);
          modal.appendChild(content);
          wrapper.appendChild(modal);
          container.appendChild(wrapper);
          
          return wrapper;
        },
        css: `
          .nt-modal-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            font-family: Inter, system-ui, sans-serif;
            pointer-events: auto;
          }
          .nt-modal {
            background: #242424;
            color: rgba(255, 255, 255, 0.87);
            width: 90%;
            max-width: 450px;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3);
            overflow: hidden;
            border: 1px solid #444;
          }
          .nt-header {
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #444;
            background: #1a1a1a;
          }
          .nt-title {
            font-weight: 600;
            font-size: 1.1rem;
          }
          .nt-close {
            background: transparent;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: color 0.2s;
          }
          .nt-close:hover {
            color: #fff;
          }
          .nt-content {
            padding: 1.25rem;
            max-height: 60vh;
            overflow-y: auto;
            line-height: 1.5;
          }
          .nt-content p {
            margin: 0;
            font-size: 1rem;
          }
          .nt-content ul {
            margin: 0;
            padding-left: 1.25rem;
          }
          .nt-content li {
            margin-bottom: 0.5rem;
          }
          .nt-content li:last-child {
            margin-bottom: 0;
          }
          @media (prefers-color-scheme: light) {
            .nt-modal {
              background: #ffffff;
              color: #213547;
              border-color: #eee;
            }
            .nt-header {
              background: #f9f9f9;
              border-color: #eee;
            }
            .nt-close:hover {
              color: #000;
            }
          }
        `,
      });
      ui.mount();
    };

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
        // Use a slight delay to ensure the page is visible
        setTimeout(() => {
          showModal(matches);
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
