import './style.css';
import { addReminder } from '@/utils/storage';
import { MatchType } from '@/utils/types';
import { setupI18n, t } from '@/utils/i18n';

// Initialize i18n
setupI18n();

const urlInput = document.querySelector<HTMLInputElement>('#url')!;
const matchTypeSelect = document.querySelector<HTMLSelectElement>('#matchType')!;
const noteTextarea = document.querySelector<HTMLTextAreaElement>('#note')!;
const saveButton = document.querySelector<HTMLButtonElement>('#save')!;
const statusDiv = document.querySelector<HTMLDivElement>('#status')!;

// Pre-fill current URL
browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  const currentTab = tabs[0];
  if (currentTab?.url) {
    urlInput.value = currentTab.url;
  }
});

saveButton.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const matchType = matchTypeSelect.value as MatchType;
  const note = noteTextarea.value.trim();

  if (!url || !note) {
    showStatus(t('status_fill_fields'), 'error');
    return;
  }

  try {
    await addReminder({
      url,
      matchType,
      note,
    });
    showStatus(t('status_saved'), 'success');
    noteTextarea.value = '';
    
    // Optionally close popup after save
    // setTimeout(() => window.close(), 1500);
  } catch (e) {
    showStatus(t('status_error'), 'error');
    console.error(e);
  }
});

function showStatus(message: string, type: 'success' | 'error') {
  statusDiv.textContent = message;
  statusDiv.className = type;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 3000);
}
