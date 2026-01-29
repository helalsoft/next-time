import { storage } from '@wxt-dev/storage';
import { Reminder } from './types';

export const remindersStorage = storage.defineItem<Reminder[]>('local:reminders', {
  defaultValue: [],
});

export interface PopupDraft {
  url: string;
  note: string;
  matchType: MatchType;
}

export const draftStorage = storage.defineItem<PopupDraft | null>('local:popup_draft', {
  defaultValue: null,
});

export async function addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>) {
  const reminders = await remindersStorage.getValue();
  const newReminder: Reminder = {
    ...reminder,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await remindersStorage.setValue([...reminders, newReminder]);
  return newReminder;
}

export async function getReminders() {
  return await remindersStorage.getValue();
}

export async function removeReminder(id: string) {
  const reminders = await remindersStorage.getValue();
  await remindersStorage.setValue(reminders.filter((r: Reminder) => r.id !== id));
}

export async function updateReminder(id: string, updates: Partial<Reminder>) {
  const reminders = await remindersStorage.getValue();
  await remindersStorage.setValue(
    reminders.map((r: Reminder) => (r.id === id ? { ...r, ...updates } : r))
  );
}

export async function setReminders(reminders: Reminder[]) {
  await remindersStorage.setValue(reminders);
}
