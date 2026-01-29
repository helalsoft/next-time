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
const searchInput = document.querySelector<HTMLInputElement>('#search-input')!;
const domainFilter = document.querySelector<HTMLSelectElement>('#domain-filter')!;

// Modal elements
const editModal = document.querySelector<HTMLDivElement>('#edit-modal')!;
const editUrlInput = document.querySelector<HTMLInputElement>('#edit-url')!;
const editMatchTypeSelect = document.querySelector<HTMLSelectElement>('#edit-matchType')!;
const editNoteTextarea = document.querySelector<HTMLTextAreaElement>('#edit-note')!;
const saveEditButton = document.querySelector<HTMLButtonElement>('#save-edit')!;
const cancelEditButton = document.querySelector<HTMLButtonElement>('#cancel-edit')!;

let currentlyEditingId: string | null = null;
let allReminders: Reminder[] = [];

async function loadReminders() {
  allReminders = await getReminders();
  updateDomainFilter();
  renderReminders();
}

function getDomainFromUrl(url: string): string {
  try {
    let hostname = '';
    if (url.includes('://')) {
      // Use a regex to extract hostname safely even if it contains wildcards
      const match = url.match(/:\/\/(.[^/]+)/);
      hostname = match ? match[1] : '';
    } else {
      hostname = url.split('/')[0];
    }
    
    // Remove wildcards and www
    hostname = hostname.replace(/^\*\./, '').replace(/^www\./, '').toLowerCase();
    
    const parts = hostname.split('.');
    if (parts.length > 2) {
      // Heuristic for common multi-part TLDs (e.g., .co.uk, .com.tr)
      const secondToLast = parts[parts.length - 2];
      const multiPartTlds = ['com', 'co', 'net', 'org', 'gov', 'edu', 'asn', 'id', 'web'];
      
      if (multiPartTlds.includes(secondToLast) && parts.length >= 3) {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch (e) {
    return url;
  }
}

function updateDomainFilter() {
  const selectedDomain = domainFilter.value;
  const domains = new Set<string>();
  
  allReminders.forEach(reminder => {
    domains.add(getDomainFromUrl(reminder.url));
  });

  const sortedDomains = Array.from(domains).sort();
  
  // Keep the "All Domains" option
  domainFilter.innerHTML = `<option value="">${t('all_domains')}</option>`;
  
  sortedDomains.forEach(domain => {
    const option = document.createElement('option');
    option.value = domain;
    option.textContent = domain;
    if (domain === selectedDomain) {
      option.selected = true;
    }
    domainFilter.appendChild(option);
  });
}

function renderReminders() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedDomain = domainFilter.value;
  
  const filteredReminders = allReminders.filter(reminder => {
    const matchesSearch = 
      reminder.url.toLowerCase().includes(searchQuery) ||
      reminder.note.toLowerCase().includes(searchQuery);
    
    const matchesDomain = !selectedDomain || getDomainFromUrl(reminder.url) === selectedDomain;
    
    return matchesSearch && matchesDomain;
  });

  if (filteredReminders.length === 0) {
    remindersList.innerHTML = '';
    noRemindersDiv.style.display = 'block';
    noRemindersDiv.textContent = searchQuery ? t('no_search_results') : t('no_reminders');
    return;
  }

  noRemindersDiv.style.display = 'none';
  remindersList.innerHTML = filteredReminders
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
      const id = (e.currentTarget as HTMLButtonElement).dataset.id;
      if (id && confirm(t('delete_confirm'))) {
        await removeReminder(id);
        loadReminders();
      }
    });
  });

  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLButtonElement).dataset.id;
      if (id) {
        const reminder = allReminders.find(r => r.id === id);
        if (reminder) {
          openEditModal(reminder);
        }
      }
    });
  });
}

searchInput.addEventListener('input', renderReminders);
domainFilter.addEventListener('change', renderReminders);

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
