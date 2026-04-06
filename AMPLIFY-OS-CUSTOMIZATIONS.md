---
title: AmplifyOS Customizations - GoHighLevel MCP Server
status: active
created: '2025-01-31'
updated: '2025-01-31'
type: documentation
category: customizations
tags:
- amplify-os
- customizations
- forms
- voice-ai
file_path: 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP/AMPLIFY-OS-CUSTOMIZATIONS.md
---

# AmplifyOS Customizations - GoHighLevel MCP Server

> **Fork**: [AmplifySystems/GoHighLevel-MCP](https://github.com/AmplifySystems/GoHighLevel-MCP)  
> **Upstream**: [mastanley13/GoHighLevel-MCP](https://github.com/mastanley13/GoHighLevel-MCP)

---

## 📋 Overview

This document tracks all **custom modifications** made to the upstream GoHighLevel MCP server for AmplifyOS-specific needs.

**Purpose**: Ensure we can merge upstream updates while preserving our customizations.

---

## 🎯 Custom Features Added

### 1. **Form Tools** ✅ (In Progress)

**Location**: `src/tools/form-tools.ts`

**Purpose**: Enable programmatic form creation and management for AmplifyOS automation.

**Tools Added**:
- `create_form` - Create new forms
- `update_form` - Update existing forms
- `get_form` - Retrieve form details
- `list_forms` - List all forms
- `delete_form` - Delete forms

**Use Cases**:
- Ads Plumbing Pre-Call Preparation Form automation
- Dynamic form creation for partner accounts
- Form deployment across locations

**Status**: ✅ **Registered** in `server.ts` and `http-server.ts`. Form API methods in `ghl-api-client` may still need to be added for full runtime support (create/update/get/list/delete).

---

### 2. **Voice AI Tools** ✅ (Planned)

**Location**: `src/tools/voice-ai-tools.ts`

**Purpose**: Enable programmatic Voice AI agent management for Quan Voice AI deployment.

**Tools Planned**:
- `create_voice_ai_agent` - Create Voice AI agents
- `update_voice_ai_agent` - Update agent configurations
- `get_voice_ai_agent` - Retrieve agent details
- `list_voice_ai_agents` - List all agents
- `set_agent_goals` - Configure agent objectives
- `get_agent_dashboard` - Retrieve analytics
- `delete_voice_ai_agent` - Remove agents

**Use Cases**:
- Quan Voice AI deployment automation
- Agent configuration management
- Multi-location agent deployment

**Status**: 📋 **Planned**

---

---

## 📁 File Structure

### Custom Files Added

```
GoHighLevel-MCP/
├── src/
│   ├── tools/
│   │   ├── form-tools.ts          # NEW - Form management
│   │   └── voice-ai-tools.ts       # NEW - Voice AI management
│   └── ...
├── docs/
│   └── amplify-os/
│       ├── AMPLIFY-OS-CUSTOMIZATIONS.md  # This file
│       ├── MAINTENANCE-GUIDE.md          # Upstream merge guide
│       └── CHANGELOG.md                  # Custom changes log
└── ...
```

### Modified Files

- `src/server.ts` — Added QuanProvisioningTools import, instantiation, ListTools registration, and executeTool dispatch
- `src/http-server.ts` — Same additions as server.ts for HTTP transport path

---

## 🔄 Upstream Merge Strategy

### Conflict Prevention

1. **Isolated Custom Files**: All custom tools in separate files
2. **No Core Modifications**: Avoid modifying upstream core files
3. **Feature Flags**: Use environment variables for custom features
4. **Documentation**: Track all changes in this file

### Merge Process

See `docs/amplify-os/MAINTENANCE-GUIDE.md` for detailed merge instructions.

**Quick Steps**:
1. Fetch upstream: `git fetch upstream`
2. Merge: `git merge upstream/main`
3. Resolve conflicts (if any)
4. Test custom features
5. Update this document

---

## 📝 Change Log

### 2026-04-06
- ✅ Built `quan-provisioning-tools.ts` — 5 tools for Quan Intelligence provisioning (provision schema, status check, contact sync, session log, brand config)
- ✅ Registered in `server.ts` and `http-server.ts`
- ✅ Defined `custom_objects.quan_profile`, `custom_objects.quan_brand`, `custom_objects.quan_session` canonical schemas
- ✅ Architecture doc: [QUAN-GHL-CUSTOM-OBJECTS-AI-STUDIO-QLF-ARCHITECTURE.md](../../../../docs/architecture/QUAN-GHL-CUSTOM-OBJECTS-AI-STUDIO-QLF-ARCHITECTURE.md)

### 2025-01-31
- ✅ Forked repository from mastanley13/GoHighLevel-MCP
- ✅ Set up upstream tracking
- ✅ Created documentation structure
- 🔨 Started Form Tools implementation
- 📋 Planned Voice AI Tools implementation

---

## 🚀 Deployment

### Local Development

```bash
cd 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP
npm install
npm run build
npm start
```

### Cursor MCP Configuration

Update `.cursor/mcp.json` to use forked repository:

```json
{
  "mcpServers": {
    "amplify-os-ghl-mcp": {
      "command": "node",
      "args": [
        "/Users/skyfresh/Documents/GitHub/FreshHouse-Network/0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP/dist/server.js"
      ],
      "env": {
        "GHL_API_KEY": "your_api_key",
        "GHL_LOCATION_ID": "your_location_id",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com"
      }
    }
  }
}
```

---

## 🔗 Related Documentation

- [[MAINTENANCE-GUIDE|Maintenance Guide]] - Upstream merge process
- [[HIGHLEVEL-MCP-SERVER-STRATEGY|MCP Server Strategy]] - Overall strategy
- [[HIGHLEVEL-PRIVATE-INTEGRATION-SCOPES-COMPLETE|Private Integration Scopes]] - Scope reference

---

**Last Updated**: 2025-01-31  
**Maintainer**: Amplify Systems Team

