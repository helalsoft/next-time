import './style.css';
import { getReminders, removeReminder } from '@/utils/storage';
import { Reminder } from '@/utils/types';

const remindersList = document.querySelector<HTMLTableSectionElement>('#reminders-list')!;
const noRemindersDiv = document.querySelector<HTMLDivElement>('#no-reminders')!;
const refreshButton = document.querySelector<HTMLButtonElement>('#refresh')!;

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
        <td><span class="match-tag">${reminder.matchType}</span></td>
        <td>${escapeHtml(reminder.note)}</td>
        <td>${new Date(reminder.createdAt).toLocaleString()}</td>
        <td>
          <button class="delete-btn" data-id="${reminder.id}">Delete</button>
        </td>
      </tr>
    `
    )
    .join('');

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id;
      if (id && confirm('Are you sure you want to delete this reminder?')) {
        await removeReminder(id);
        loadReminders();
      }
    });
  });
}

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
