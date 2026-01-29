export function setupI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = browser.i18n.getMessage(key as any);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)) {
      el.placeholder = browser.i18n.getMessage(key as any);
    }
  });
}

export function t(key: string, substitutions?: string | string[]): string {
  return browser.i18n.getMessage(key as any, substitutions);
}
