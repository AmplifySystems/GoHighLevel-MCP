---
title: BusyBee GHL MCP 2026 vs Amplify OS GHL MCP — comparison
status: active
created: '2026-04-06'
updated: '2026-04-06'
related_docs:
- ./GHL-API-SURFACE-MCP-TOOLS-AND-BUSYBEE-EVALUATION.md
type: reference
category: mcp
tags:
- ghl
- mcp
- amplify-os
- comparison
file_path: 0_amplify-systems/backend/mcp-servers/amplify-os-ghl-mcp/docs/amplify-os/BUSYBEE-GHL-MCP-2026-VS-AMPLIFY-OS-GHL-MCP.md
---

# BusyBee GHL MCP 2026 Complete vs Amplify OS GHL MCP

**Purpose:** Side-by-side capability map between the community [BusyBee3333/Go-High-Level-MCP-2026-Complete](https://github.com/busybee3333/go-high-level-mcp-2026-complete) server and this repo’s **Amplify OS GHL MCP** package (`amplify-os-ghl-mcp`).

**Relationship:** Same broad lineage (GoHighLevel MCP / mastanley13-style base). BusyBee is a **wide community expansion**; Amplify OS GHL MCP is a **fork** with **Amplify- and Quan-specific** tools and runbooks. Neither “supports” the other as a dependency—they are parallel codebases; BusyBee is a **merge / cherry-pick reference**.

**Related:** [GHL-API-SURFACE-MCP-TOOLS-AND-BUSYBEE-EVALUATION.md](./GHL-API-SURFACE-MCP-TOOLS-AND-BUSYBEE-EVALUATION.md) (MCP tools vs API endpoints, Agent Studio naming, how to evaluate BusyBee) · [AMPLIFY-OS-CUSTOMIZATIONS.md](../../AMPLIFY-OS-CUSTOMIZATIONS.md) · [SETUP-GUIDE.md](./SETUP-GUIDE.md) · [GHL-MCP-LOCATION-REGISTRY.md](../../../ghl-mcp/docs/GHL-MCP-LOCATION-REGISTRY.md)

---

## Caveats

1. **BusyBee** tool counts and categories are taken from **their public README** (not independently audited in this doc).
2. **Amplify OS** figures are from **counting registered MCP tools** in `src/tools/*.ts` (single-quote `name: '...'` pattern). **Total: 272 tools** as of this document’s date.
3. Some Amplify code **imports API types** for operations that are **not** exposed as MCP tools (e.g. parts of invoices); the table reflects **exposed tools**, not every client method.

---

## Executive summary

| Dimension | BusyBee 2026 Complete | Amplify OS GHL MCP (this repo) |
|-----------|-------------------------|--------------------------------|
| Approx. tool count | 520–563+ (per their docs) | **272** (counted in source) |
| Breadth | Very wide GHL surface: **Agent Studio**, **workflow builder**, **phone**, **Voice AI**, **proposals**, **marketplace**, richer **invoices** / **surveys** / **workflows** / **email ISV** | Strong on **contacts, conversations, calendar (extended), commerce, core CRM**; thinner on **workflows / surveys / invoices / email ISV** vs BusyBee; **no** separate MCP tools for Agent Studio, workflow builder, phone, proposals, marketplace |
| Unique value | Maximum advertised GHL API coverage via MCP | **Quan provisioning**, **forms**, **knowledge bases**, **Conversation AI agent** helpers, **GHL app URL builder**, **extended calendar**, **`render_simple_email_html`**, `docs/amplify-os/` runbooks, multi-location Cursor wiring |

---

## Domain-by-domain comparison

| Feature domain | BusyBee (advertised) | Amplify OS GHL MCP | Verdict |
|----------------|----------------------|--------------------|---------|
| Contacts, tasks, notes, workflow/campaign enrollment | 31 tools | **31** | Parity |
| Messaging and conversations | 20 | **20** | Parity |
| Blog | 7 | **7** | Parity |
| Opportunities and pipelines | 10 | **10** | Parity |
| Calendar and appointments | 14 | **39** | **Amplify deeper** (groups, resources, notifications, blocked slots, appointment notes, etc.) |
| Email marketing (templates, campaigns) | 5 | **6** | **Amplify +1** (`render_simple_email_html`) |
| Location / sub-account admin | 24 | **24** | Parity |
| Email ISV (domains, DNS, providers, stats) | 9 | **1** (`verify_email` only) | **BusyBee much broader** |
| Social posting and accounts | 17 | **17** | Parity |
| Media library | 3 | **3** | Parity |
| Custom objects | 9 | **9** | Parity |
| Associations and relations | 10 | **10** | Parity |
| Custom fields v2 | 8 | **8** | Parity |
| Workflows (list, get, status, trigger, executions, delete, …) | 8 | **1** (`ghl_get_workflows`) | **BusyBee much broader** |
| Surveys | 9 (full CRUD + submissions + stats) | **2** (list surveys + get submissions) | **BusyBee much broader** |
| Store / shipping | 18 | **18** | Parity |
| Products and collections | 10 | **10** | Parity |
| Payments / orders / subscriptions / coupons | 20 | **20** | Parity |
| Invoices, schedules, estimates, templates, void, text2pay, … | 39 | **18** | **BusyBee many more invoice/estimate operations** |
| Voice AI (telephony-style agents) | 11 | **0** as `voice_ai_*` | **BusyBee**; Amplify doc still lists Voice AI tooling as **planned** in customizations |
| Conversation AI agents (separate API) | (varies in their catalog) | **3** | **Amplify** (`ghl_create/search/get_conversation_ai_agent`) |
| Knowledge bases + FAQ | (in their expansion) | **4** | **Amplify** |
| Forms | (in their expansion) | **5** | **Amplify** |
| Proposals and documents | 4 | **0** | **BusyBee only** |
| Custom menus | 5 | **0** | **BusyBee only** |
| Marketplace and SaaS billing charges | 7 | **0** | **BusyBee only** |
| Phone system (numbers, BYOC, voicemail, recordings, …) | 15 | **0** | **BusyBee only** |
| **Agent Studio** (agents, versions, deploy, graph) | 8 | **0** | **BusyBee only** |
| **Workflow builder** (create/publish/clone workflow JSON) | 7 | **0** | **BusyBee only** |
| **Quan / Amplify OS provisioning** | — | **5** | **Amplify only** |
| **HighLevel app URL builder** | — | **1** | **Amplify only** |

---

## Tool counts by file (Amplify OS — reference)

Counted via `name: '...'` registrations under `src/tools/`:

| File | Tools |
|------|------:|
| `calendar-tools.ts` | 39 |
| `contact-tools.ts` | 31 |
| `store-tools.ts` | 18 |
| `invoices-tools.ts` | 18 |
| `social-media-tools.ts` | 17 |
| `payments-tools.ts` | 20 |
| `location-tools.ts` | 24 |
| `conversation-tools.ts` | 20 |
| `opportunity-tools.ts` | 10 |
| `products-tools.ts` | 10 |
| `association-tools.ts` | 10 |
| `object-tools.ts` | 9 |
| `custom-field-v2-tools.ts` | 8 |
| `blog-tools.ts` | 7 |
| `email-tools.ts` | 6 |
| `quan-provisioning-tools.ts` | 5 |
| `form-tools.ts` | 5 |
| `knowledge-base-tools.ts` | 4 |
| `conversation-ai-tools.ts` | 3 |
| `media-tools.ts` | 3 |
| `survey-tools.ts` | 2 |
| `app-url-tools.ts` | 1 |
| `email-isv-tools.ts` | 1 |
| `workflow-tools.ts` | 1 |
| **Total** | **272** |

---

## Merge strategy (if widening Amplify toward BusyBee)

1. Prefer **isolated new tool files** and minimal edits to shared core (see [AMPLIFY-OS-CUSTOMIZATIONS.md](../../AMPLIFY-OS-CUSTOMIZATIONS.md)).
2. Reconcile **scopes** in GHL Private Integration tokens before enabling high-risk tools (Agent Studio, workflow builder, phone purchases).
3. After large merges: rebuild (`npm run build`), restart MCP in Cursor, and spot-check [GHL-MCP-LOCATION-REGISTRY.md](../../../ghl-mcp/docs/GHL-MCP-LOCATION-REGISTRY.md) so the correct sub-account is still targeted.

---

## What’s next

- **Prioritize gaps:** Agent Studio + workflow builder vs invoices + email ISV vs phone—pick one subdomain to port first.
- **Optional:** Script a name-level diff against a local clone of BusyBee’s repo for an exact tool list delta.
