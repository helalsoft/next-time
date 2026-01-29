type MessageKey = Parameters<typeof browser.i18n.getMessage>[0];

export function setupI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const message = browser.i18n.getMessage(key as MessageKey);
      if (el.tagName === 'TITLE') {
        document.title = message;
      } else {
        el.textContent = message;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)) {
      el.placeholder = browser.i18n.getMessage(key as MessageKey);
    }
  });
}

export function t(key: string, substitutions?: string | string[]): string {
  return browser.i18n.getMessage(key as MessageKey, substitutions);
}
