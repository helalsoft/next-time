import './style.css';
import { addReminder, draftStorage, PopupDraft } from '@/utils/storage';
import { MatchType } from '@/utils/types';
import { setupI18n, t } from '@/utils/i18n';

// Initialize i18n
setupI18n();

const urlInput = document.querySelector<HTMLInputElement>('#url')!;
const matchTypeSelect = document.querySelector<HTMLSelectElement>('#matchType')!;
const noteTextarea = document.querySelector<HTMLTextAreaElement>('#note')!;
const saveButton = document.querySelector<HTMLButtonElement>('#save')!;
const statusDiv = document.querySelector<HTMLDivElement>('#status')!;

// Function to save current state as draft
async function saveDraft() {
  const draft: PopupDraft = {
    url: urlInput.value,
    matchType: matchTypeSelect.value as MatchType,
    note: noteTextarea.value,
  };
  await draftStorage.setValue(draft);
}

// Restore draft or pre-fill current URL
async function init() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  // Disable logic on internal chrome pages
  if (currentTab?.url?.startsWith('chrome://')) {
    urlInput.disabled = true;
    matchTypeSelect.disabled = true;
    noteTextarea.disabled = true;
    saveButton.disabled = true;
    noteTextarea.placeholder = "Disabled on internal Chrome pages";
    return;
  }

  const draft = await draftStorage.getValue();
  
  if (draft) {
    urlInput.value = draft.url;
    matchTypeSelect.value = draft.matchType;
    noteTextarea.value = draft.note;
  } else {
    if (currentTab?.url) {
      urlInput.value = currentTab.url;
    }
  }

  // Add listeners to save draft on any change
  [urlInput, matchTypeSelect, noteTextarea].forEach(el => {
    el.addEventListener('input', saveDraft);
  });
}

init();

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
    // Clear draft after successful save
    await draftStorage.setValue(null);
    
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
