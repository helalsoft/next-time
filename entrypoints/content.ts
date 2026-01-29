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
          :host {
            all: initial !important;
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 2147483647 !important;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
          }
          .nt-modal-wrapper {
            all: initial !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(4px) !important;
            font-family: inherit !important;
            pointer-events: auto !important;
          }
          .nt-modal {
            all: initial !important;
            background: #242424 !important;
            color: rgba(255, 255, 255, 0.87) !important;
            width: 90% !important;
            max-width: 450px !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3) !important;
            overflow: hidden !important;
            border: 1px solid #444 !important;
            display: flex !important;
            flex-direction: column !important;
            font-family: inherit !important;
          }
          .nt-header {
            all: initial !important;
            padding: 16px 20px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 1px solid #444 !important;
            background: #1a1a1a !important;
            font-family: inherit !important;
            box-sizing: border-box !important;
          }
          .nt-title {
            all: initial !important;
            font-weight: 600 !important;
            font-size: 18px !important;
            color: #fff !important;
            font-family: inherit !important;
          }
          .nt-close {
            all: initial !important;
            background: transparent !important;
            border: none !important;
            color: #888 !important;
            font-size: 24px !important;
            cursor: pointer !important;
            padding: 0 !important;
            line-height: 1 !important;
            transition: color 0.2s !important;
            font-family: Arial, sans-serif !important;
          }
          .nt-close:hover {
            color: #fff !important;
          }
          .nt-content {
            all: initial !important;
            display: block !important;
            padding: 20px !important;
            max-height: 60vh !important;
            overflow-y: auto !important;
            line-height: 1.5 !important;
            font-family: inherit !important;
            color: rgba(255, 255, 255, 0.87) !important;
            box-sizing: border-box !important;
          }
          .nt-content p {
            all: initial !important;
            display: block !important;
            margin: 0 !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            color: inherit !important;
            font-family: inherit !important;
          }
          .nt-content ul {
            all: initial !important;
            display: block !important;
            margin: 0 !important;
            padding-left: 20px !important;
            list-style-type: disc !important;
            color: inherit !important;
            font-family: inherit !important;
          }
          .nt-content li {
            all: initial !important;
            display: list-item !important;
            margin-bottom: 8px !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            color: inherit !important;
            font-family: inherit !important;
          }
          .nt-content li:last-child {
            margin-bottom: 0 !important;
          }
          @media (prefers-color-scheme: light) {
            .nt-modal {
              background: #ffffff !important;
              color: #213547 !important;
              border-color: #eee !important;
            }
            .nt-header {
              background: #f9f9f9 !important;
              border-color: #eee !important;
            }
            .nt-title {
              color: #213547 !important;
            }
            .nt-content {
              color: #213547 !important;
            }
            .nt-close:hover {
              color: #000 !important;
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
      lastAlertedUrl = currentUrl;

      const reminders = await remindersStorage.getValue();
      const matches: string[] = [];

      for (const reminder of reminders) {
        if (matchesUrl(currentUrl, reminder.url, reminder.matchType)) {
          matches.push(reminder.note);
        }
      }

      if (matches.length > 0) {
        // Use a slight delay to ensure the page is visible
        setTimeout(() => {
          // Double check URL hasn't changed during the delay (for SPAs)
          if (window.location.href === currentUrl) {
            showModal(matches);
          }
        }, 500);
      }
    };

    // Initial check on page load
    await checkAndShowReminders();

    // Listen for SPA navigation (back/forward)
    const handlePopstate = () => checkAndShowReminders();
    window.addEventListener('popstate', handlePopstate);
    ctx.onInvalidated(() => {
      window.removeEventListener('popstate', handlePopstate);
    });

    // Listen for messages from background script about URL changes (SPAs)
    browser.runtime.onMessage.addListener((message: { type: string }) => {
      if (message.type === 'REFRESH_REMINDERS') {
        checkAndShowReminders();
      }
    });
  },
});
