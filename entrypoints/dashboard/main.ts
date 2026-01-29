import './style.css';
import { getReminders, removeReminder, updateReminder, setReminders } from '@/utils/storage';
import { Reminder } from '@/utils/types';
import { setupI18n, t } from '@/utils/i18n';
import { MatchType } from '@/utils/types';

// Initialize i18n
setupI18n();

const remindersList = document.querySelector<HTMLTableSectionElement>('#reminders-list')!;
const noRemindersDiv = document.querySelector<HTMLDivElement>('#no-reminders')!;
const refreshButton = document.querySelector<HTMLButtonElement>('#refresh')!;
const exportButton = document.querySelector<HTMLButtonElement>('#export-btn')!;
const importButton = document.querySelector<HTMLButtonElement>('#import-btn')!;
const importInput = document.querySelector<HTMLInputElement>('#import-input')!;

// Modal elements
const editModal = document.querySelector<HTMLDivElement>('#edit-modal')!;
const editUrlInput = document.querySelector<HTMLInputElement>('#edit-url')!;
const editMatchTypeSelect = document.querySelector<HTMLSelectElement>('#edit-matchType')!;
const editNoteTextarea = document.querySelector<HTMLTextAreaElement>('#edit-note')!;
const saveEditButton = document.querySelector<HTMLButtonElement>('#save-edit')!;
const cancelEditButton = document.querySelector<HTMLButtonElement>('#cancel-edit')!;

let currentlyEditingId: string | null = null;

async function loadReminders() {
  const reminders = await getReminders();
  
  if (reminders.length === 0) {
    remindersList.innerHTML = '';
    noRemindersDiv.style.display = 'block';
    return;
  }

  noRemindersDiv.style.display = 'none';
  remindersList.innerHTML = reminders
    .sort((a: Reminder, b: Reminder) => b.createdAt - a.createdAt)
    .map(
      (reminder: Reminder) => `
      <tr data-id="${reminder.id}">
        <td>${escapeHtml(reminder.url)}</td>
        <td><span class="match-tag">${t('match_type_' + reminder.matchType)}</span></td>
        <td class="note-cell" title="${escapeHtml(reminder.note)}">${escapeHtml(reminder.note)}</td>
        <td>${new Date(reminder.createdAt).toLocaleString()}</td>
        <td>
          <button class="edit-btn" data-id="${reminder.id}">${t('edit_button')}</button>
          <button class="delete-btn" data-id="${reminder.id}">${t('delete_button')}</button>
        </td>
      </tr>
    `
    )
    .join('');

  // Add event listeners to buttons
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id;
      if (id && confirm(t('delete_confirm'))) {
        await removeReminder(id);
        loadReminders();
      }
    });
  });

  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id;
      if (id) {
        const reminders = await getReminders();
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
          openEditModal(reminder);
        }
      }
    });
  });
}

function openEditModal(reminder: Reminder) {
  currentlyEditingId = reminder.id;
  editUrlInput.value = reminder.url;
  editMatchTypeSelect.value = reminder.matchType;
  editNoteTextarea.value = reminder.note;
  editModal.style.display = 'block';
}

function closeEditModal() {
  editModal.style.display = 'none';
  currentlyEditingId = null;
}

saveEditButton.addEventListener('click', async () => {
  if (currentlyEditingId) {
    await updateReminder(currentlyEditingId, {
      url: editUrlInput.value.trim(),
      matchType: editMatchTypeSelect.value as MatchType,
      note: editNoteTextarea.value.trim(),
    });
    closeEditModal();
    loadReminders();
  }
});

cancelEditButton.addEventListener('click', closeEditModal);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

// Export Logic
exportButton.addEventListener('click', async () => {
  const reminders = await getReminders();
  const dataStr = JSON.stringify(reminders, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'next-time-reminders.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
});

// Import Logic
importButton.addEventListener('click', () => {
  importInput.click();
});

importInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const content = event.target?.result as string;
      const importedReminders = JSON.parse(content);
      
      // Basic validation: must be an array
      if (!Array.isArray(importedReminders)) {
        throw new Error('Invalid format');
      }

      // Further validation: check for required fields in first element if exists
      if (importedReminders.length > 0) {
        const r = importedReminders[0];
        if (!r.url || !r.note || !r.matchType) {
          throw new Error('Invalid reminder object');
        }
      }

      if (confirm(t('import_button') + '?')) {
        await setReminders(importedReminders);
        alert(t('import_success'));
        loadReminders();
      }
    } catch (err) {
      console.error('Import failed:', err);
      alert(t('import_error'));
    }
    // Clear the input so the same file can be selected again
    importInput.value = '';
  };
  reader.readAsText(file);
});

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

refreshButton.addEventListener('click', loadReminders);

// Initial load
loadReminders();
