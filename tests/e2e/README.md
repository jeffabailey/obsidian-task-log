# End-to-End (E2E) Tests

This directory contains end-to-end tests for the Task Log plugin using Playwright. These tests run the plugin in a real Obsidian environment to ensure it works correctly from a user's perspective.

## Overview

The E2E tests:
- Launch Obsidian with a sandbox test vault
- Load the Task Log plugin
- Test real user interactions (marking tasks complete, using commands, etc.)
- Verify the plugin behaves correctly in the actual Obsidian environment

## Test Structure

- **`global-setup.ts`**: Prepares the sandbox vault and copies the plugin
- **`global-teardown.ts`**: Cleans up after tests
- **`obsidian-helper.ts`**: Utility class for common Obsidian operations
- **`task-logging.spec.ts`**: Main test suite for task logging functionality
- **`sandbox-vault/`**: Test vault with sample files and plugin configuration

## Running E2E Tests

### Prerequisites
1. Build the plugin: `npm run build`
2. Install Playwright browsers: `npx playwright install`

### Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/task-logging.spec.ts
```

## Test Scenarios

### 1. Automatic Task Logging
- Marks tasks as complete
- Verifies automatic logging to task-log.md
- Checks log file formatting and content

### 2. Manual Command Execution
- Tests the command palette integration
- Verifies manual logging command works
- Checks user feedback (notices)

### 3. Settings Configuration
- Tests plugin settings UI
- Verifies enable/disable functionality
- Checks settings persistence

### 4. Log Formatting
- Verifies timestamp formatting
- Checks source file information
- Validates task content and separators

### 5. Multiple Task Handling
- Tests multiple task completions
- Verifies proper log entry separation
- Checks cumulative logging

### 6. Plugin State Management
- Tests plugin enable/disable behavior
- Verifies logging stops when disabled
- Checks state persistence

## Sandbox Vault

The test vault (`sandbox-vault/`) contains:
- Sample markdown files with tasks
- Plugin configuration (enabled by default)
- Pre-configured settings for testing

## CI/CD Integration

For CI environments:
- Use `xvfb-run` on Linux for headless Electron support
- Tests run sequentially to avoid conflicts
- Screenshots and videos captured on failure

## Troubleshooting

### Common Issues
1. **Plugin not loading**: Ensure `main.js` is built and copied to sandbox
2. **Electron launch failures**: Check sandbox path and permissions
3. **Selector timeouts**: May need to adjust wait times for slower systems

### Debug Mode
Use `npm run test:e2e:debug` to:
- Step through tests interactively
- Inspect the Obsidian UI
- Debug selector issues

## Adding New Tests

1. **Test Structure**: Follow the existing pattern in `task-logging.spec.ts`
2. **Helper Methods**: Add new utility methods to `ObsidianHelper` class
3. **Test Data**: Update `sandbox-vault/` with required test files
4. **Assertions**: Use Playwright's expect API for verifications

## Performance Notes

- E2E tests are slower than unit tests (~30-60 seconds per test)
- Run these tests before major releases
- Use unit tests for fast feedback during development
- E2E tests catch integration issues that unit tests might miss
