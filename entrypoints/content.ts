import { remindersStorage, removeReminder } from '@/utils/storage';
import { matchesUrl } from '@/utils/matching';
import { t } from '@/utils/i18n';
import { Reminder } from '@/utils/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main(ctx) {
    let lastAlertedUrl = '';
    let ui: any = null;

    const showModal = async (reminders: Reminder[]) => {
      if (ui) ui.remove();

      let currentIndex = 0;

      ui = await createShadowRootUi(ctx, {
        name: 'next-time-modal',
        position: 'modal',
        zIndex: 2147483647,
        onMount: (container) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'nt-modal-wrapper';
          
          const modal = document.createElement('div');
          modal.className = 'nt-modal';
          
          const closeBtn = document.createElement('button');
          closeBtn.className = 'nt-close';
          closeBtn.innerHTML = '&times;';
          closeBtn.onclick = () => ui.remove();
          
          const content = document.createElement('div');
          content.className = 'nt-content';
          
          const p = document.createElement('p');
          p.textContent = reminders[0].note;
          content.appendChild(p);
          
          modal.appendChild(closeBtn);
          modal.appendChild(content);

          const footer = document.createElement('div');
          footer.className = 'nt-footer';

          const pagination = document.createElement('div');
          pagination.className = 'nt-pagination';
          
          const prevBtn = document.createElement('button');
          prevBtn.className = 'nt-nav-btn';
          prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
          
          const count = document.createElement('span');
          count.className = 'nt-count';
          
          const nextBtn = document.createElement('button');
          nextBtn.className = 'nt-nav-btn';
          nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;

          const trashBtn = document.createElement('button');
          trashBtn.className = 'nt-trash';
          trashBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

          pagination.appendChild(prevBtn);
          pagination.appendChild(count);
          pagination.appendChild(nextBtn);

          const updatePagination = () => {
            if (reminders.length > 1) {
              pagination.style.setProperty('display', 'flex', 'important');
              count.textContent = `${currentIndex + 1} / ${reminders.length}`;
              prevBtn.disabled = currentIndex === 0;
              nextBtn.disabled = currentIndex === reminders.length - 1;
            } else {
              pagination.style.setProperty('display', 'none', 'important');
            }
            
            const contentEl = modal.querySelector('.nt-content p');
            if (contentEl) {
              contentEl.textContent = reminders[currentIndex].note;
              modal.querySelector('.nt-content')?.scrollTo(0, 0);
            }
          };

          prevBtn.onclick = () => {
            if (currentIndex > 0) {
              currentIndex--;
              updatePagination();
            }
          };

          nextBtn.onclick = () => {
            if (currentIndex < reminders.length - 1) {
              currentIndex++;
              updatePagination();
            }
          };

          trashBtn.onclick = async () => {
            const reminderToDelete = reminders[currentIndex];
            if (confirm(t('delete_confirm'))) {
              await removeReminder(reminderToDelete.id);
              reminders.splice(currentIndex, 1);
              
              if (reminders.length === 0) {
                ui.remove();
              } else {
                if (currentIndex >= reminders.length) {
                  currentIndex = reminders.length - 1;
                }
                updatePagination();
              }
            }
          };

          footer.appendChild(pagination);
          footer.appendChild(trashBtn);
          modal.appendChild(footer);
          
          // Initial update
          updatePagination();
          
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
            max-width: 500px !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3) !important;
            overflow: visible !important;
            border: 1px solid #444 !important;
            display: flex !important;
            flex-direction: column !important;
            font-family: inherit !important;
            position: relative !important;
          }
          .nt-footer {
            all: initial !important;
            padding: 12px 24px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: #242424 !important;
            font-family: inherit !important;
            box-sizing: border-box !important;
            border-bottom-left-radius: 12px !important;
            border-bottom-right-radius: 12px !important;
          }
          .nt-pagination {
            all: initial !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
            flex-direction: row !important;
            gap: 12px !important;
            background: #333 !important;
            padding: 4px 16px !important;
            border-radius: 20px !important;
            font-family: inherit !important;
          }
          .nt-count {
            all: initial !important;
            font-size: 13px !important;
            color: #ccc !important;
            font-family: inherit !important;
            min-width: 40px !important;
            text-align: center !important;
            font-weight: 500 !important;
          }
          .nt-nav-btn {
            all: initial !important;
            background: transparent !important;
            border: none !important;
            color: #fff !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 28px !important;
            height: 28px !important;
            border-radius: 50% !important;
            transition: background 0.2s !important;
          }
          .nt-nav-btn svg {
            display: block !important;
            width: 18px !important;
            height: 18px !important;
          }
          .nt-nav-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1) !important;
          }
          .nt-nav-btn:disabled {
            opacity: 0.3 !important;
            cursor: not-allowed !important;
          }
          .nt-close {
            all: initial !important;
            position: absolute !important;
            top: -12px !important;
            right: -12px !important;
            background: #242424 !important;
            border: 1px solid #444 !important;
            color: #888 !important;
            font-size: 20px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            transition: all 0.2s !important;
            font-family: inherit !important;
            padding-bottom: 2px !important;
            z-index: 1 !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          }
          .nt-close:hover {
            color: #fff !important;
            background: #333 !important;
            border-color: #555 !important;
            transform: scale(1.1) !important;
          }
          .nt-trash {
            all: initial !important;
            margin-left: auto !important;
            background: transparent !important;
            border: none !important;
            color: #ef4444 !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
            transition: all 0.2s !important;
          }
          .nt-trash:hover {
            background: rgba(239, 68, 68, 0.1) !important;
            color: #f87171 !important;
          }
          .nt-content {
            all: initial !important;
            display: block !important;
            padding: 24px 24px 12px 24px !important;
            height: auto !important;
            max-height: 400px !important;
            overflow-y: auto !important;
            line-height: 1.6 !important;
            font-family: inherit !important;
            color: rgba(255, 255, 255, 0.87) !important;
            box-sizing: border-box !important;
          }
          .nt-content::-webkit-scrollbar {
            width: 8px !important;
          }
          .nt-content::-webkit-scrollbar-track {
            background: transparent !important;
          }
          .nt-content::-webkit-scrollbar-thumb {
            background: #444 !important;
            border-radius: 4px !important;
          }
          .nt-content::-webkit-scrollbar-thumb:hover {
            background: #555 !important;
          }
          .nt-content p {
            all: initial !important;
            display: block !important;
            margin: 0 !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: inherit !important;
            font-family: inherit !important;
            white-space: pre-wrap !important;
          }
          @media (prefers-color-scheme: light) {
            .nt-modal {
              background: #ffffff !important;
              color: #213547 !important;
              border-color: #eee !important;
            }
            .nt-footer {
              background: #ffffff !important;
            }
            .nt-pagination {
              background: #f0f0f0 !important;
            }
            .nt-count {
              color: #666 !important;
            }
            .nt-nav-btn {
              color: #213547 !important;
            }
            .nt-nav-btn:hover:not(:disabled) {
              background: rgba(0, 0, 0, 0.05) !important;
            }
            .nt-content {
              color: #213547 !important;
            }
            .nt-content::-webkit-scrollbar-thumb {
              background: #ccc !important;
            }
            .nt-content::-webkit-scrollbar-thumb:hover {
              background: #bbb !important;
            }
            .nt-close {
              background: #fff !important;
              border-color: #eee !important;
              color: #666 !important;
            }
            .nt-close:hover {
              color: #000 !important;
              background: #f9f9f9 !important;
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
      const matches: Reminder[] = [];

      for (const reminder of reminders) {
        if (matchesUrl(currentUrl, reminder.url, reminder.matchType)) {
          matches.push(reminder);
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

    // Listen for SPA navigation using WXT's built-in event
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      checkAndShowReminders();
    });

    // Listen for messages from background script about URL changes or tab activation
    browser.runtime.onMessage.addListener((message: { type: string }) => {
      if (message.type === 'REFRESH_REMINDERS') {
        checkAndShowReminders();
      }
    });
  },
});
