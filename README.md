# Next Time

A modern Chrome extension built with [WXT](https://wxt.dev) that allows you to leave reminders on specific websites. When you visit a matched URL, it displays a clean, paginated alert to ensure you don't forget your task.

## Features

- **Flexible URL Matching**: Set reminders for entire websites (Domain), exact pages, or URL prefixes.
- **Paginated Alerts**: Easily browse through multiple reminders on the same page with a clean navigation interface.
- **Works Everywhere**: Seamlessly detects navigation in modern web apps (SPAs) to show reminders without page reloads.
- **Polished UI**: Custom-built modal with style isolation that looks consistent across all sites and respects your system's light/dark mode.
- **Draft Persistence**: Your notes are saved as you type, so you never lose them if the popup closes accidentally.
- **Multi-language Support**: Fully localized in English and Turkish.
- **Privacy Focused**: All data is stored locally in your browser. No external servers or tracking.
- **Safety Restrictions**: Automatically disabled on internal `chrome://` pages for stability.

## Use Cases

- **Shopping Assistants**: Set a reminder on a shopping site's cart URL (`*/cart`, `*/checkout`) listing specific items you need to buy (e.g., "Don't forget the power bank and AA batteries").
- **Account Verification**: Remind yourself to check specific security settings when visiting an account dashboard.
- **Recurring Tasks**: Leave notes on banking or bill-pay sites to remember specific transaction details.

## Installation

1. Download the latest release.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the `.output/chrome-mv3` folder.

## Usage

1. Navigate to a website where you want to leave a reminder.
2. Click the **Next Time** icon in your toolbar.
3. Enter your note and choose how you want it to match (Domain, Exact, or Starts With).
4. Click **Save**. The next time you visit that page, your reminder will appear!
