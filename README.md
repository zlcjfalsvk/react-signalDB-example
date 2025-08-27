# SignalDB React Todo App

A modern, feature-rich Todo application built with React, TypeScript, and [SignalDB](https://signaldb.js.org). This application demonstrates the power of reactive data management with SignalDB while providing a comprehensive todo management experience.

## 🚀 Features

### Core Functionality
- ✅ **Full CRUD Operations** - Create, read, update, and delete todos with ease
- 📝 **Rich Todo Items** - Support for title, description, priority, tags, and due dates
- 🔄 **Real-time Updates** - Reactive UI updates powered by [SignalDB](https://signaldb.js.org)
- 💾 **Local Persistence** - All data saved to localStorage automatically
- 🎯 **Smart Validation** - Comprehensive form validation with helpful error messages

### Advanced Features
- 🔍 **Advanced Search & Filter** - Search by title, description, or tags
- 📊 **Rich Statistics** - Track completion rates, priority distribution, and productivity
- 🏷️ **Tag Management** - Organize todos with multiple tags
- 📅 **Due Date Tracking** - Visual indicators for overdue and upcoming tasks
- ⚡ **Performance Optimized** - Virtual scrolling for 100+ items
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop

### User Experience
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- 🌙 **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- ⚡ **Instant Actions** - Quick toggles, inline editing, and bulk operations
- 📈 **Visual Feedback** - Loading states, animations, and confirmations
- 🔄 **Bulk Operations** - Select multiple todos for mass actions

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Database**: [SignalDB](https://signaldb.js.org) (reactive database)
- **State Management**: React Hooks + SignalDB reactivity
- **Styling**: Tailwind CSS with custom components
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd react-signaldb-example

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate test coverage report
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── TodoForm/       # Todo creation form
│   ├── TodoItem/       # Individual todo display
│   ├── TodoList/       # Todo list with virtualization
│   ├── TodoFilter/     # Search and filter controls
│   └── TodoStats/      # Statistics dashboard
├── hooks/              # Custom React hooks
│   ├── useSignalDB.ts  # Generic SignalDB hook
│   └── useTodos.ts     # Todo-specific operations
├── lib/                # Library configurations
│   └── db.ts          # SignalDB setup
├── types/              # TypeScript definitions
│   └── todo.ts        # Todo interfaces
├── utils/              # Utility functions
│   ├── dateHelpers.ts # Date manipulation
│   └── validators.ts  # Form validation
├── App.tsx            # Main application
└── main.tsx          # Entry point
```

## 🎯 Usage Guide

### Creating a Todo

1. Click the "Add Todo" button in the navigation
2. Fill in the required title (minimum 2 characters)
3. Optionally add:
   - Description (up to 500 characters)
   - Priority level (Low, Medium, High)
   - Tags (comma-separated, up to 10 tags)
   - Due date
4. Click "Add Todo" to save

### Managing Todos

- **Toggle Completion**: Click the checkbox to mark as complete/incomplete
- **Edit Inline**: Double-click on a todo or click the edit button
- **Delete**: Click the delete button (requires double-click confirmation)
- **View Details**: All todo information is displayed in the card

### Filtering and Searching

- **Search**: Type in the search box to filter by title, description, or tags
- **Status Filter**: Show all, active, or completed todos
- **Priority Filter**: Filter by priority level
- **Tag Filter**: Filter by specific tags
- **Date Range**: Filter todos within a date range
- **Sort**: Order by date, title, or priority

### Bulk Operations

- **Select Multiple**: Click checkboxes to select multiple todos
- **Mark All Complete/Active**: Toggle all todos at once
- **Clear Completed**: Remove all completed todos
- **Clear All**: Remove all todos (with confirmation)

### Statistics View

Click "Stats" to view:
- Total, completed, and active todo counts
- Completion percentage with visual progress bar
- Priority distribution chart
- Tag usage analytics
- Today's productivity summary
- Overdue todo alerts

## 🧪 Testing

The application includes comprehensive test coverage:

### Unit Tests
- Component rendering and interactions
- Hook functionality
- Utility functions
- SignalDB operations

### Integration Tests
- Complete user workflows
- Data persistence
- State management
- Component communication

### E2E Tests
- Full application workflows
- Search and filter operations
- Bulk actions
- Offline functionality
- Performance with large datasets

Run tests with:
```bash
npm run test           # Run all tests
npm run test:ui        # Interactive test UI
npm run test:coverage  # Coverage report
npm run test:e2e       # End-to-end tests
```

## 🎨 Customization

### Styling
The app uses Tailwind CSS with custom component classes. Modify `src/index.css` to customize:
- Color schemes
- Component styles
- Animations
- Responsive breakpoints

### Database Configuration
SignalDB settings can be modified in `src/lib/db.ts`:
- Collection indexes
- Storage adapters
- Migration logic
- Performance optimizations

### Validation Rules
Customize validation in `src/utils/validators.ts`:
- Field requirements
- Length limits
- Pattern matching
- Custom rules

## 🚀 Performance

- **Virtual Scrolling**: Efficiently renders large lists (100+ items)
- **Debounced Search**: 300ms delay for smooth typing
- **Memoization**: Prevents unnecessary re-renders
- **Indexed Queries**: Optimized database lookups
- **Lazy Loading**: Components loaded on demand

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **High Contrast**: Supports high contrast mode

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 🐛 Known Issues

- Virtual scrolling may have minor visual glitches with very rapid scrolling
- Date picker may not work correctly in some older browsers
- Tag autocomplete suggestions are limited to existing tags

## 📮 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide reproduction steps for bugs

## 🙏 Acknowledgments

- SignalDB team for the reactive database
- React team for the framework
- Tailwind CSS for the styling system
- Vite for the blazing fast build tool

---

Built with ❤️ using SignalDB and React
