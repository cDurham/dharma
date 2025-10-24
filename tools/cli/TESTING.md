# CLI Testing Guide

## 🧪 How to Test Your CLI Manually

### Prerequisites

1. Make sure you're in the project root
2. Build the CLI first: `npm run cli:build`
3. For active development, use watch mode: `npm run cli:watch`

---

## 📋 Test Checklist

### ✅ Phase 1: Safe Commands (No Side Effects)

These commands just read state and won't modify anything:

```bash
# 1. Test banner display
npm run dharma

# 2. Test help
npm run dharma -- --help
npm run dharma -- -h

# 3. Test version
npm run dharma -- --version
npm run dharma -- -V

# 4. Test status (reads container state)
npm run dharma -- status
npm run dharma -- ps  # alias

# 5. Test subcommand help
npm run dharma -- dev --help
npm run dharma -- logs --help
npm run dharma -- db --help
npm run dharma -- exec --help
```

**Expected Results:**
- ✓ Lotus banner shows in colors (pink → purple → gold → cyan)
- ✓ Help text displays all commands
- ✓ Version shows `1.0.0`
- ✓ Status shows all services (running or not found)
- ✓ Subcommand help shows options

---

### ✅ Phase 2: Environment Commands (Requires Docker)

These will start/stop containers:

```bash
# 6. Start development environment
npm run dharma -- dev up

# Expected: 
# - Spinner shows "Starting development environment..."
# - Services start successfully
# - Shows "✓ Development environment started"
# - Shows info message "Run dharma logs to view logs"

# 7. Check status after starting
npm run dharma -- status

# Expected:
# - Shows running containers with green "●"
# - Shows status like "Up X seconds"

# 8. Stop environment
npm run dharma -- dev down

# Expected:
# - Spinner shows "Stopping development environment..."
# - Shows "✓ Development environment stopped"
```

---

### ✅ Phase 3: Logs Commands (Safe - Read Only)

```bash
# 9. Interactive log selection (will prompt)
npm run dharma -- logs

# Expected:
# - Shows multiselect prompt with all services
# - Pre-selects api-dev and web-dev
# - Space to select, Enter to confirm

# 10. Specific service logs
npm run dharma -- logs api-dev

# 11. Multiple services
npm run dharma -- logs api-dev web-dev

# 12. All services
npm run dharma -- logs all

# 13. With options
npm run dharma -- logs api-dev --tail 100
npm run dharma -- logs api-dev --no-follow

# To exit logs: Ctrl+C
```

---

### ✅ Phase 4: Database Commands (Requires Running DB)

```bash
# Make sure environment is running first
npm run dharma -- dev up

# 14. Push database schema
npm run dharma -- db push

# 15. Seed database
npm run dharma -- db seed

# 16. Open Drizzle Studio (opens in browser)
npm run dharma -- db studio
# Ctrl+C to stop

# 17. Open database shell
npm run dharma -- db shell
# Type \q to quit

# 18. Generate migration
npm run dharma -- db generate

# 19. Run migrations
npm run dharma -- db migrate

# 20. Reset database (careful - drops data!)
npm run dharma -- db reset
```

---

### ✅ Phase 5: Exec Commands

```bash
# 21. Interactive service selection
npm run dharma -- exec
# Select a service, then enter command (e.g., "sh")

# 22. Shell into API container
npm run dharma -- exec api-dev sh
# Type 'exit' to leave

# 23. Shell into Web container
npm run dharma -- exec web-dev sh

# 24. Run a specific command
npm run dharma -- exec api-dev npm test
npm run dharma -- exec api-dev node -v
```

---

### ✅ Phase 6: Advanced Dev Commands

```bash
# 25. Start with build
npm run dharma -- dev up --build

# 26. Stop with volumes removed
npm run dharma -- dev down --volumes

# 27. Restart environment
npm run dharma -- dev restart

# 28. Rebuild all services
npm run dharma -- dev rebuild all
# Expected: Sequential spinners for stop, build, start

# 29. Rebuild specific service
npm run dharma -- dev rebuild api-dev

# 30. Nuclear option (careful!)
npm run dharma -- dev nuke
# Expected:
# - Stops containers
# - Removes volumes
# - Prunes volumes
# - Shows success messages with spinners

# 31. Full reset (careful - resets database!)
npm run dharma -- dev reset

# Expected sequence:
# - Removes existing environment
# - Builds and starts containers
# - Waits for services (5 seconds)
# - Pushes database schema
# - Seeds database
# - Shows "✨ Environment reset complete!"

# 32. Reset without seeding
npm run dharma -- dev reset --skip-seed
```

---

## 🎨 What to Look For

### **Visual Tests**

1. **Lotus Banner**
   - Should show gradient colors: pink → purple → gold → cyan
   - Should only appear with no args or --help
   - Should NOT appear when running specific commands

2. **Spinners**
   - Should start with message
   - Should update to success (✓) or fail (✗)
   - Should show appropriate messages

3. **Colors**
   - ✓ Green for success
   - ✗ Red for errors
   - ℹ Blue for info
   - ⚠ Yellow for warnings

### **Functional Tests**

1. **Error Handling**
   ```bash
   # Test invalid service
   npm run dharma -- logs invalid-service
   # Should show error and list valid services
   
   # Test invalid command
   npm run dharma -- invalid-command
   # Should show error
   
   # Test rebuild non-rebuildable service
   npm run dharma -- dev rebuild db
   # Should show error about missing build config
   ```

2. **Interactive Prompts**
   ```bash
   # Test logs selection
   npm run dharma -- logs
   # Use arrow keys, space to select, enter to confirm
   # Press Escape or Ctrl+C to cancel
   
   # Test exec selection
   npm run dharma -- exec
   # Select service and command
   ```

3. **Validation**
   ```bash
   # Services are validated before operations
   # Capabilities are checked (canExec, canRebuild)
   # Should show helpful error messages
   ```

---

## 🐛 Common Issues to Test

### Issue 1: Services Not Found

```bash
npm run dharma -- status
# If shows "Not found", containers aren't running
# Fix: npm run dharma -- dev up
```

### Issue 2: Permission Denied

```bash
# If Docker commands fail
# Fix: Make sure Docker Desktop is running
# Fix: Check Docker permissions
```

### Issue 3: Port Already in Use

```bash
# If "dev up" fails with port conflict
# Fix: Stop other services using those ports
# Fix: Check docker-compose.yml for port mappings
```

### Issue 4: Database Not Ready

```bash
# If db commands fail immediately after "dev up"
# Fix: Wait a few seconds for services to initialize
# Or use: npm run dharma -- dev reset
```

---

## 🔄 Quick Test Cycle

For rapid testing during development:

```bash
# Terminal 1 - Watch mode
npm run cli:watch

# Terminal 2 - Test commands
npm run dharma -- status
npm run dharma -- dev up
# ... test your changes
npm run dharma -- dev down
```

---

## 📊 Testing the New Features

### Test `withSpinner()` Utility

The following commands should show clean spinner animations:

1. `dev up` - Single spinner
2. `dev down` - Single spinner
3. `dev nuke` - Two sequential spinners
4. `dev rebuild all` - Three sequential spinners
5. `dev reset` - Multiple spinners in sequence

**Expected:**
- ✓ Each spinner starts with message
- ✓ Each spinner ends with success/fail
- ✓ No manual spinner code visible in output
- ✓ Consistent error handling

### Test Banner

```bash
# Should show banner
npm run dharma
npm run dharma -- --help
npm run dharma -- -h

# Should NOT show banner
npm run dharma -- status
npm run dharma -- dev up
npm run dharma -- logs
```

---

## 🎯 Edge Cases to Test

1. **Ctrl+C Handling**
   ```bash
   npm run dharma -- dev up
   # Press Ctrl+C while spinner is running
   # Should exit gracefully
   ```

2. **Invalid Options**
   ```bash
   npm run dharma -- dev up --invalid-flag
   # Should show error or ignore
   ```

3. **Empty Selections**
   ```bash
   npm run dharma -- logs
   # Press Enter without selecting anything
   # Should show "No services selected" and exit
   ```

4. **Multiple Rapid Commands**
   ```bash
   npm run dharma -- dev up && npm run dharma -- status
   # Should work fine
   ```

---

## ✅ Success Criteria

Your CLI is working correctly if:

- ✓ Lotus banner appears in color
- ✓ All spinners show and succeed/fail appropriately
- ✓ Error messages are helpful and consistent
- ✓ Commands complete without TypeScript errors
- ✓ Docker operations work as expected
- ✓ Interactive prompts are responsive
- ✓ Colors display correctly in terminal

---

## 🚀 Quick Start Testing Script

Copy and paste this to test the essentials:

```bash
# Build
npm run cli:build

# Test banner
npm run dharma

# Test safe commands
npm run dharma -- --version
npm run dharma -- status

# Test environment (if you want to start services)
npm run dharma -- dev up
sleep 3
npm run dharma -- status
npm run dharma -- dev down

# Test error handling
npm run dharma -- logs invalid-service

echo "✅ Basic tests complete!"
```

---

## 📝 Test Results Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

[ ] Banner displays correctly
[ ] Help commands work
[ ] Status command works
[ ] Dev up/down works
[ ] Logs command works (interactive)
[ ] Logs command works (direct)
[ ] Database commands work
[ ] Exec commands work
[ ] Rebuild commands work
[ ] Error handling works
[ ] Spinners display correctly
[ ] Colors display correctly
[ ] Interactive prompts work

Issues found:
- 
- 

Notes:
- 
```

---

Happy testing! 🧪✨

