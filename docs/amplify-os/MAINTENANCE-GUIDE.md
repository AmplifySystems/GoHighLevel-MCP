---
title: Upstream Merge Maintenance Guide
status: active
created: '2025-01-31'
updated: '2025-01-31'
type: guide
category: maintenance
tags:
- maintenance
- upstream
- merge
- git
file_path: 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP/docs/amplify-os/MAINTENANCE-GUIDE.md
---

# Upstream Merge Maintenance Guide

> **How to merge upstream updates while preserving AmplifyOS customizations**

---

## 🎯 Goal

Keep AmplifyOS fork up-to-date with upstream improvements while preserving our custom Form and Voice AI tools.

---

## 📋 Prerequisites

1. ✅ Upstream remote configured: `git remote -v` should show `upstream`
2. ✅ Local changes committed or stashed
3. ✅ Current branch: `main` (or your working branch)

---

## 🔄 Merge Process

### Step 1: Fetch Upstream Changes

```bash
cd 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP
git fetch upstream
```

### Step 2: Check What's New

```bash
# See commits ahead of us
git log HEAD..upstream/main --oneline

# See what files changed
git diff HEAD..upstream/main --name-only
```

### Step 3: Merge Upstream

```bash
# Ensure you're on main branch
git checkout main

# Merge upstream changes
git merge upstream/main
```

### Step 4: Resolve Conflicts (If Any)

**If conflicts occur:**

1. **Check conflict files**:
   ```bash
   git status
   ```

2. **Resolve conflicts**:
   - Open conflicted files
   - Look for `<<<<<<<`, `=======`, `>>>>>>>` markers
   - Keep our customizations (AmplifyOS changes)
   - Keep upstream improvements (bug fixes, new features)

3. **Common Conflict Areas**:
   - ❌ **Avoid conflicts**: We keep custom tools in separate files
   - ⚠️ **Possible conflicts**: If upstream adds similar tools
   - ✅ **Resolution**: Merge both implementations or choose best

4. **After resolving**:
   ```bash
   git add <resolved-files>
   git commit -m "Merge upstream/main - resolved conflicts"
   ```

### Step 5: Test Custom Features

```bash
# Build
npm run build

# Test Form Tools
# (Run tests or manual verification)

# Test Voice AI Tools
# (Run tests or manual verification)
```

### Step 6: Update Documentation

1. Update `AMPLIFY-OS-CUSTOMIZATIONS.md` with merge date
2. Update `CHANGELOG.md` with upstream changes
3. Note any breaking changes

### Step 7: Push to Fork

```bash
git push origin main
```

---

## 🛡️ Conflict Prevention Strategy

### 1. Isolated Custom Files

**Our custom tools are in separate files:**
- `src/tools/form-tools.ts` - Form tools
- `src/tools/voice-ai-tools.ts` - Voice AI tools

**Why this works**: Upstream won't modify files that don't exist in their repo.

### 2. Minimal Core Modifications

**Avoid modifying:**
- `src/server.ts` - Core server logic
- `src/http-server.ts` - HTTP server
- `package.json` - Dependencies (unless necessary)

**If we must modify core files:**
- Document why
- Add comments: `// AMPLIFY-OS: Custom modification`
- Consider feature flags

### 3. Feature Flags

Use environment variables for custom features:

```typescript
// Only enable if flag set
if (process.env.ENABLE_FORM_TOOLS === 'true') {
  // Register form tools
}
```

---

## 📅 Recommended Merge Schedule

### Weekly (Recommended)
- Check for upstream updates
- Merge if minor updates (bug fixes, patches)

### Monthly (Minimum)
- Review upstream changes
- Merge significant updates
- Test thoroughly

### Before Major Releases
- Always merge upstream before deploying
- Full test suite
- Update documentation

---

## 🔍 Pre-Merge Checklist

- [ ] Local changes committed
- [ ] Upstream fetched: `git fetch upstream`
- [ ] Changes reviewed: `git log HEAD..upstream/main`
- [ ] Backup current state (optional): `git tag backup-before-merge`
- [ ] Ready to resolve conflicts (if any)

---

## 🚨 Troubleshooting

### Merge Conflicts

**If conflicts in core files:**
1. Check if upstream added similar functionality
2. Compare implementations
3. Merge best of both or keep ours if better

**If conflicts in custom files:**
- Shouldn't happen (files don't exist upstream)
- If it does, upstream may have added similar tools
- Review and merge appropriately

### Build Failures After Merge

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Tests Failing

1. Check if upstream changed test structure
2. Update our tests to match
3. Ensure custom tool tests still pass

---

## 📊 Merge History

| Date | Upstream Version | Changes Merged | Conflicts | Status |
|------|------------------|----------------|-----------|--------|
| 2025-01-31 | Initial fork | Fork setup | None | ✅ Complete |

---

## 🔗 Related Documentation

- [[AMPLIFY-OS-CUSTOMIZATIONS|Customizations]] - What we've added
- [[CHANGELOG|Changelog]] - Detailed change history
- [[HIGHLEVEL-MCP-SERVER-STRATEGY|MCP Server Strategy]] - Overall strategy

---

**Last Updated**: 2025-01-31  
**Next Review**: After first upstream merge

