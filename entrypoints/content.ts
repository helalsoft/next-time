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
          
          const header = document.createElement('div');
          header.className = 'nt-header';
          
          const titleContainer = document.createElement('div');
          titleContainer.className = 'nt-title-container';

          const title = document.createElement('span');
          title.className = 'nt-title';
          title.textContent = t('extension_name');
          titleContainer.appendChild(title);

          if (matches.length > 1) {
            const pagination = document.createElement('div');
            pagination.className = 'nt-pagination';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'nt-nav-btn';
            prevBtn.innerHTML = '&lsaquo;';
            
            const count = document.createElement('span');
            count.className = 'nt-count';
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'nt-nav-btn';
            nextBtn.innerHTML = '&rsaquo;';

            const updatePagination = () => {
              count.textContent = `${currentIndex + 1} / ${matches.length}`;
              prevBtn.disabled = currentIndex === 0;
              nextBtn.disabled = currentIndex === matches.length - 1;
              
              const content = modal.querySelector('.nt-content');
              if (content) {
                content.innerHTML = '';
                const p = document.createElement('p');
                p.textContent = matches[currentIndex];
                content.appendChild(p);
              }
            };

            prevBtn.onclick = () => {
              if (currentIndex > 0) {
                currentIndex--;
                updatePagination();
              }
            };

            nextBtn.onclick = () => {
              if (currentIndex < matches.length - 1) {
                currentIndex++;
                updatePagination();
              }
            };

            pagination.appendChild(prevBtn);
            pagination.appendChild(count);
            pagination.appendChild(nextBtn);
            titleContainer.appendChild(pagination);
            
            // Initial update
            setTimeout(updatePagination, 0);
          }
          
          const closeBtn = document.createElement('button');
          closeBtn.className = 'nt-close';
          closeBtn.innerHTML = '&times;';
          closeBtn.onclick = () => ui.remove();
          
          header.appendChild(titleContainer);
          header.appendChild(closeBtn);
          
          const content = document.createElement('div');
          content.className = 'nt-content';
          
          const p = document.createElement('p');
          p.textContent = matches[0];
          content.appendChild(p);
          
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
            max-width: 500px !important;
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
            padding: 12px 20px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 1px solid #444 !important;
            background: #1a1a1a !important;
            font-family: inherit !important;
            box-sizing: border-box !important;
          }
          .nt-title-container {
            all: initial !important;
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
            font-family: inherit !important;
          }
          .nt-title {
            all: initial !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            color: #fff !important;
            font-family: inherit !important;
          }
          .nt-pagination {
            all: initial !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            background: #333 !important;
            padding: 4px 12px !important;
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
          }
          .nt-nav-btn {
            all: initial !important;
            background: transparent !important;
            border: none !important;
            color: #fff !important;
            font-size: 18px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 24px !important;
            height: 24px !important;
            border-radius: 50% !important;
            transition: background 0.2s !important;
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
            padding: 24px !important;
            height: 500px !important;
            overflow-y: auto !important;
            line-height: 1.6 !important;
            font-family: inherit !important;
            color: rgba(255, 255, 255, 0.87) !important;
            box-sizing: border-box !important;
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
            .nt-header {
              background: #f9f9f9 !important;
              border-color: #eee !important;
            }
            .nt-title {
              color: #213547 !important;
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
