# Changelog

## [1.0.0] - 2025-10-24

### ✨ Added
- **Beautiful Lotus Banner** 🪷
  - Colorized ASCII art lotus flower with gradient colors (pink → purple → gold → cyan)
  - Displays on `npm run dharma` with no arguments or `--help`
  - Can be reused inline with `lotusIcon()` helper

- **Utility Functions**
  - `withSpinner()` - Simplified spinner handling with auto-success/fail
  - `createSpinner()` - Manual spinner control when needed
  - `CommandResult` type for consistent return types

- **Documentation**
  - `IMPROVEMENTS.md` - Detailed improvement suggestions
  - `CHANGELOG.md` - This file!
  - Enhanced `README.md` with lotus preview

### 🔧 Changed
- Refactored `dev up` command to use `withSpinner`
- Refactored `dev down` command to use `withSpinner`
- Refactored `dev nuke` command to use `withSpinner`
- Refactored `dev reset` command to use `withSpinner`
- Refactored `dev rebuild` command to use `withSpinner` and `createSpinner`
- Added `type: "module"` to CLI package.json to eliminate Node warnings

### 🧹 Improved
- Reduced code duplication by ~50-60 lines
- Eliminated 8+ instances of manual spinner handling
- Better type safety with explicit return types
- More consistent error handling across commands

### 📦 Technical
- Added proper TypeScript types for all utilities
- Improved import organization
- Better separation of concerns

### 🎯 Future Improvements Suggested
See `IMPROVEMENTS.md` for detailed suggestions including:
- Service validation helper
- Environment variable support
- Parallel operations
- Health check awaiter
- Command aliases
- Interactive mode
- Config file support

