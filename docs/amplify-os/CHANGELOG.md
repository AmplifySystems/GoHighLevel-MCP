---
title: AmplifyOS Customizations Changelog
status: active
created: '2025-01-31'
updated: '2025-01-31'
type: changelog
category: documentation
tags:
- changelog
- customizations
file_path: 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP/docs/amplify-os/CHANGELOG.md
---

# AmplifyOS Customizations Changelog

> **Track all custom modifications to the upstream GoHighLevel MCP server**

---

## 2025-01-31 - Initial Fork & Form Tools

### Added
- ✅ Forked repository from [mastanley13/GoHighLevel-MCP](https://github.com/mastanley13/GoHighLevel-MCP)
- ✅ Set up upstream tracking (`upstream` remote)
- ✅ Created documentation structure (`docs/amplify-os/`)
- ✅ Created `FormTools` class (`src/tools/form-tools.ts`)
  - `ghl_create_form` - Create new forms
  - `ghl_update_form` - Update existing forms
  - `ghl_get_form` - Get form details
  - `ghl_list_forms` - List all forms
  - `ghl_delete_form` - Delete forms

### Documentation
- ✅ `AMPLIFY-OS-CUSTOMIZATIONS.md` - Customizations overview
- ✅ `MAINTENANCE-GUIDE.md` - Upstream merge process
- ✅ `SETUP-GUIDE.md` - Setup instructions
- ✅ `CHANGELOG.md` - This file

### In Progress
- 🔨 Form Tools API client methods (need to add to `ghl-api-client.ts`)
- 🔨 Server registration (need to add FormTools to `server.ts`)
- 🔨 HTTP server registration (need to add to `http-server.ts`)

### Planned
- 📋 Voice AI Tools implementation
- 📋 Testing and validation
- 📋 Deployment configuration

---

## Upstream Sync History

| Date | Upstream Commit | Changes Merged | Status |
|------|----------------|----------------|--------|
| 2025-01-31 | Initial fork | Fork setup | ✅ Complete |

---

**Format**: Keep entries in reverse chronological order (newest first)

