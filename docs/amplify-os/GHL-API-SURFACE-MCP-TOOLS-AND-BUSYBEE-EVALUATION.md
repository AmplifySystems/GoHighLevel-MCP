---
title: HighLevel API surface vs MCP tools — reality check and BusyBee evaluation
status: active
created: '2026-04-06'
updated: '2026-04-06'
type: reference
category: mcp
tags:
- ghl
- mcp
- api
- agent-studio
- evaluation
file_path: 0_amplify-systems/backend/mcp-servers/amplify-os-ghl-mcp/docs/amplify-os/GHL-API-SURFACE-MCP-TOOLS-AND-BUSYBEE-EVALUATION.md
---

# HighLevel API surface vs MCP tools — reality check and BusyBee evaluation

**Purpose:** Answer why a third-party MCP server can advertise “520+ tools,” whether that equals HighLevel’s REST API size, how **Agent Studio** fits (vs other “AI” naming), why Amplify OS GHL MCP is not a 1:1 mirror of every API operation, and how to **safely evaluate** [BusyBee’s MCP](https://github.com/busybee3333/go-high-level-mcp-2026-complete) on a sandbox sub-account.

**Paired doc:** [BUSYBEE-GHL-MCP-2026-VS-AMPLIFY-OS-GHL-MCP.md](./BUSYBEE-GHL-MCP-2026-VS-AMPLIFY-OS-GHL-MCP.md) (feature-domain diff vs our fork).

---

## 1. MCP “tools” are not the same as “API endpoints”

| Concept | What it is |
|---------|------------|
| **REST API route / operation** | One HTTP method + path + resource (e.g. `GET /contacts/:id`, `POST /invoices`). Vendor may version paths and group under OpenAPI or doc sections. |
| **MCP tool** | A named capability exposed to an LLM client. Often **one tool ≈ one API call**, but not always: some tools are thin wrappers, some could aggregate steps, and maintainers **split one resource into many tools** (list, get, update, delete, search, bulk, etc.). |

So a server that claims **520–563+ tools** is reporting **MCP tool registrations**, not “HighLevel has 563 REST endpoints.” The two numbers are **related but not equal**:

- **Many tools** can map to **fewer** underlying base paths (CRUD + variants + filters).
- **Fewer MCP tools** can still mean **most APIs are reachable** if you only exposed a subset of operations on purpose.

**Conclusion:** BusyBee is not claiming HighLevel has exactly 563 endpoints; they are claiming their **MCP catalog** has that many **tools**. Treat the headline number as **product marketing for the MCP layer**, not an official GHL endpoint census.

---

## 2. Does HighLevel publish “the max number of API endpoints”?

**Not as a single stable integer** in public materials reviewed for this note (2026-04). HighLevel documents a large, multi-section API on the developer marketplace:

- **API hub:** [HighLevel API Documentation (Marketplace / developer portal)](https://marketplace.gohighlevel.com/docs)
- **Scopes (what tokens can do):** [Scopes | HighLevel API](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/index.html)

**How to stay current (recommended practice):**

1. Use the **official docs** above as SSOT for new capabilities (Agent Studio, invoices, phone, etc.).
2. When you need a **machine-readable** inventory, check whether HighLevel provides **OpenAPI / export** in the developer portal for your integration type (availability changes over time—verify in UI, do not assume).
3. Re-run a **diff** against our fork’s `src/tools/` when you bump dependencies or merge upstream MCP code.

This repo does **not** maintain a live endpoint count table here—it would go stale quickly. This document explains **how to reason** about counts instead.

---

## 3. Agent Studio vs “AI Studio” vs Conversation AI (naming)

**What BusyBee’s README refers to:** They use **“Agent Studio”** and **“GHL Agent Studio API”** (their March 2026 note), which aligns with HighLevel’s own documentation category **Agent Studio** under the marketplace API docs.

**Official Agent Studio API (vendor):**

- Overview / index: [Agent Studio API | HighLevel API](https://marketplace.gohighlevel.com/docs/ghl/agent-studio/agent-studio-api/index.html) (portal navigation may list sub-pages such as agents, versions, execute, etc.)
- Support article (public APIs in Agent Studio): [Use Public APIs for Agent Studio](https://help.gohighlevel.com/support/solutions/articles/155000007515-how-to-use-public-apis-in-agent-studio)

**“HighLevel AI Studio”** is easy to conflate with other UI or marketing labels. For **engineering**, always map questions to:

1. **Exact doc URL** on `marketplace.gohighlevel.com/docs`, or  
2. **Exact scope name** on the Private Integration (e.g. `agent-studio` style scopes if present in the Scopes doc).

**Amplify OS GHL MCP today:** We expose **Conversation AI**-oriented tools in `conversation-ai-tools.ts` (`ghl_create_conversation_ai_agent`, `ghl_search_conversation_ai_agents`, `ghl_get_conversation_ai_agent`). That is **not automatically the same** as the full **Agent Studio** lifecycle (create version, deploy to production, graph editing, etc.) that BusyBee advertises as separate MCP tools. Treat them as **related product areas** until you confirm the same base paths and scopes in the official reference.

---

## 4. Why BusyBee can expose “more” than our fork without “beating” the API

Reasons are mundane and overlapping:

1. **Merge / port lag:** Our fork prioritizes **Amplify OS + Quan** tools, **location discipline**, and **narrower** surfaces in some domains (e.g. one workflow list tool vs a full workflow management set). BusyBee merged more **community expansions** earlier.
2. **Not every client method is an MCP tool:** Our codebase may **import types** or implement **client methods** without registering a matching MCP `Tool` (see invoices and similar). That is **intentional debt or scope control**, not “the API stopped existing.”
3. **Agent ergonomics:** Very large tool lists can **degrade** LLM tool choice (noise, wrong tool). Some teams **prefer** fewer, higher-signal tools or **split MCP servers** (read vs write, or per sub-account)—we already use multiple Cursor MCP entries with different `GHL_LOCATION_ID` values (see [GHL-MCP-LOCATION-REGISTRY.md](../../../ghl-mcp/docs/GHL-MCP-LOCATION-REGISTRY.md)).
4. **Scopes and safety:** Each extra tool implies **PIT/OAuth scopes** and **blast radius**. Shipping fewer write tools is a **security and ops** decision, not ignorance of the API.

**So:** We are not “maxing out HighLevel’s API” in the sense of **exposing every operation as an MCP tool**. We **are** aligned with a **large subset** plus **custom** tools BusyBee does not have (Quan provisioning, forms, KB, app URLs, extended calendar, etc.)—see the paired comparison doc.

---

## 5. What we can learn or test from BusyBee (safely)

**Goal:** Discover **high-value gaps** (Agent Studio, workflow trigger, invoice void/text2pay, email ISV domains, phone) without replacing our fork blindly.

**Suggested approach:**

1. **Sandbox sub-account** — Private Integration with **minimal scopes** first; expand only when testing a module.
2. **Separate MCP server name in Cursor** — e.g. `ghl-busybee-sandbox` pointing at **their** built `dist/server.js`, **not** production Amplify locations.
3. **Side-by-side comparison** — Run the same natural-language task against **BusyBee** vs **Amplify OS GHL MCP** and note which tool names appear and which succeeds.
4. **Port winners** — For anything worth keeping, **cherry-pick** into `amplify-os-ghl-mcp` (see [MAINTENANCE-GUIDE.md](./MAINTENANCE-GUIDE.md) and [AMPLIFY-OS-CUSTOMIZATIONS.md](../../AMPLIFY-OS-CUSTOMIZATIONS.md)).

**Do not:** Paste PITs or API keys into chat or commit them. Use Cursor env, Signet, or local gitignored config per [AGENTS.md](../../../../../../AGENTS.md) and workspace secret rules.

---

## 6. Quick FAQ

| Question | Short answer |
|----------|----------------|
| Does BusyBee have *more API* than HighLevel? | No—both use the **same vendor API**. They may **expose more MCP tools** or **newer modules** we have not merged. |
| Is 520–563 the number of GHL endpoints? | **No.** It is their **MCP tool count** (marketing). GHL’s REST surface is large; exact totals are **not** summarized here as a fixed number. |
| Did BusyBee mean “AI Studio” or “Agent Studio”? | Their README says **Agent Studio**, which matches **vendor “Agent Studio API”** docs—not a separate claim about a differently named “AI Studio” product unless you map that phrase to a specific doc URL. |
| Why don’t we have everything? | **Scope choice**, **merge bandwidth**, **agent UX**, and **safety**—not because the API is inaccessible. |

---

## 7. Related internal paths

- [BUSYBEE-GHL-MCP-2026-VS-AMPLIFY-OS-GHL-MCP.md](./BUSYBEE-GHL-MCP-2026-VS-AMPLIFY-OS-GHL-MCP.md)
- [AMPLIFY-OS-CUSTOMIZATIONS.md](../../AMPLIFY-OS-CUSTOMIZATIONS.md)
- [SETUP-GUIDE.md](./SETUP-GUIDE.md)
- [GHL-MCP-LOCATION-REGISTRY.md](../../../ghl-mcp/docs/GHL-MCP-LOCATION-REGISTRY.md)

**External (vendor SSOT for capability):**

- [HighLevel API Documentation](https://marketplace.gohighlevel.com/docs)
- [Scopes | HighLevel API](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/index.html)
- [Use Public APIs for Agent Studio (support)](https://help.gohighlevel.com/support/solutions/articles/155000007515-how-to-use-public-apis-in-agent-studio)

**External (community MCP under discussion):**

- [BusyBee3333/Go-High-Level-MCP-2026-Complete](https://github.com/busybee3333/go-high-level-mcp-2026-complete)

---

## Maintenance

When HighLevel ships new API sections (or renames UI), update **section 3** and **section 7** links if URLs move; refresh the **paired comparison** doc when our fork’s tool count or BusyBee’s README changes materially.
