# Advanced Condition Builder

A React-based condition builder with an intuitive tag input system for creating complex logical expressions.

## Features

- **Tag-based Input System**: Mix typed text with function tags, operators, and variables
- **Smart Dropdown**: Context-aware dropdown with three tabs (Functions, Workflow, External)
- **Real-time Search**: Dynamic search across all categories as you type
- **Function Parameters**: Automatic parentheses and comma insertion for multi-parameter functions
- **Keyboard Navigation**: Navigate between tags and text inputs using arrow keys
- **Tag Management**: Remove tags with backspace, insert tags at cursor position
- **Color-coded Tags**: Visual distinction between operators, functions, workflow variables, and CRM variables

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Click the input field to open the dropdown
2. Browse functions, workflow variables, or external CRM variables
3. Click any item to add it as a tag at your cursor position
4. Type freely between tags
5. Use arrow keys to navigate, backspace to remove tags
6. When typing, the dropdown automatically switches to search mode

## Project Structure

```
src/
  ├── App.tsx          # Main component with condition builder logic
  ├── main.tsx         # Application entry point
  └── index.css        # Global styles and Tailwind imports
```

## License

MIT

