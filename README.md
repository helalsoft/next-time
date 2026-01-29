# Next Time

A modern Chrome extension built with [WXT](https://wxt.dev) that allows you to leave reminders on specific websites. When you visit a matched URL, it displays a native blocking alert to ensure you don't forget your task (e.g., checking out a shopping cart, verifying a setting).

## Features

- **Flexible URL Matching**: Choose between Whole Site (Domain), Exact Match, or Starts With patterns.
- **Smart Alerts**: If multiple reminders match a single page, they are aggregated into a single, clean, numbered list.
- **Draft Persistence**: Never lose your note if the popup accidentally closes; your input is saved as you type and restored automatically.
- **Multi-language Support**: Fully localized in English and Turkish.
- **Theme Support**: UI adapts perfectly to both Light and Dark system modes.
- **Privacy Focused**: All data is stored locally in your browser. No external servers or tracking.
- **Safety Restrictions**: Automatically disabled on internal `chrome://` pages to ensure stability.

## Installation

1. Download or clone this repository.
2. Run `bun install` to install dependencies.
3. Run `bun run build` to compile the extension.
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable "Developer mode" and click "Load unpacked".
6. Select the `.output/chrome-mv3` folder.

## Development

```bash
# Start development server
bun run dev

# Type check
bun run compile

# Build for production
bun run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
