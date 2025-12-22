---
title: AmplifyOS MCP Server Setup Guide
status: active
created: '2025-01-31'
updated: '2025-01-31'
type: guide
category: setup
tags:
- setup
- mcp
- cursor
- configuration
file_path: 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP/docs/amplify-os/SETUP-GUIDE.md
---

# AmplifyOS MCP Server Setup Guide

> **Complete setup guide for using the forked GoHighLevel MCP server in Cursor**

---

## 🎯 Quick Setup

### Step 1: Build the Server

```bash
cd 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP
npm install
npm run build
```

### Step 2: Update Cursor MCP Configuration

Edit `.cursor/mcp.json` and add/update:

```json
{
  "mcpServers": {
    "amplify-os-ghl-mcp": {
      "command": "node",
      "args": [
        "/Users/skyfresh/Documents/GitHub/FreshHouse-Network/0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP/dist/server.js"
      ],
      "env": {
        "GHL_API_KEY": "pit-79b95771-95fb-42d4-8905-f2d6178cb38b",
        "GHL_LOCATION_ID": "t56PccdwRwF55nnFRWJ4",
        "GHL_BASE_URL": "https://services.leadconnectorhq.com"
      }
    }
  }
}
```

### Step 3: Restart Cursor

1. **Quit Cursor completely** (Cmd+Q on Mac)
2. **Reopen Cursor**
3. **Verify**: Check MCP servers list - `amplify-os-ghl-mcp` should appear

---

## 🔧 Troubleshooting

### Tools Not Appearing

**Problem**: MCP server shows in list but tools don't appear

**Solutions**:

1. **Check Build**:
   ```bash
   cd 0_amplify-systems/backend/mcp-servers/GoHighLevel-MCP
   npm run build
   ```

2. **Check File Path**:
   - Ensure `dist/server.js` exists
   - Verify path in `mcp.json` is absolute and correct

3. **Check Environment Variables**:
   - `GHL_API_KEY` must be set
   - `GHL_LOCATION_ID` must be set
   - Both must be valid

4. **Check Cursor Logs**:
   - Open Cursor → View → Output
   - Look for MCP server errors
   - Check for authentication failures

5. **Verify Node.js**:
   ```bash
   node --version  # Should be 18+
   ```

### Server Won't Start

**Check**:
- Node.js version (needs 18+)
- Dependencies installed: `npm install`
- Build completed: `npm run build`
- File permissions on `dist/server.js`

### Authentication Errors

**Verify**:
- API key is correct Private Integration Token
- Location ID matches your HighLevel account
- Scopes enabled in HighLevel (View Forms, Edit Forms, etc.)

---

## 📋 Verification Checklist

- [ ] Server built successfully (`npm run build`)
- [ ] `dist/server.js` exists
- [ ] MCP config updated in `.cursor/mcp.json`
- [ ] Environment variables set correctly
- [ ] Cursor restarted completely
- [ ] MCP server appears in Cursor's MCP list
- [ ] Tools are available (269+ base tools + Form tools)
- [ ] Can execute a test tool (e.g., `ghl_get_contacts`)

---

## 🔗 Related Documentation

- [[AMPLIFY-OS-CUSTOMIZATIONS|Customizations]] - What we've added
- [[MAINTENANCE-GUIDE|Maintenance Guide]] - Upstream merge process
- [[HIGHLEVEL-MCP-SERVER-STRATEGY|MCP Server Strategy]] - Overall strategy

---

**Last Updated**: 2025-01-31

