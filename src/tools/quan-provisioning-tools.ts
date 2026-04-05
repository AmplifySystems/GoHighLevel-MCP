/**
 * Quan Intelligence Provisioning Tools for Amplify OS GHL MCP
 *
 * One-shot provisioning: deploys the full Quan Intelligence layer
 * (3 custom object schemas + all fields + KB + Conversation AI agent)
 * to any GHL partner sub-account location.
 *
 * Usage: call `provision_quan_partner_schema` with a locationId to
 * bootstrap a partner for Quan Intelligence in under 60 seconds.
 *
 * Schema keys deployed:
 *   custom_objects.quan_profile   — per-contact intelligence snapshot
 *   custom_objects.quan_brand     — partner brand configuration (1 per location)
 *   custom_objects.quan_session   — session/coaching interaction log
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

// ─── Schema Constants ────────────────────────────────────────────────────────

export const QUAN_SCHEMA_KEYS = {
  PROFILE: 'custom_objects.quan_profile',
  BRAND: 'custom_objects.quan_brand',
  SESSION: 'custom_objects.quan_session',
} as const;

export const QUAN_FIELD_DEFS = {
  [QUAN_SCHEMA_KEYS.PROFILE]: [
    { name: 'Quan Contact ID', dataType: 'TEXT', description: 'Supabase master_contacts UUID for bidirectional sync' },
    { name: 'Wealth Dynamics Profile', dataType: 'SINGLE_OPTIONS', description: 'WD archetype from profiling',
      options: ['Creator', 'Mechanic', 'Supporter', 'Star', 'Deal Maker', 'Accumulator', 'Lord', 'Trader'] },
    { name: 'Genius Type', dataType: 'SINGLE_OPTIONS', description: 'Genius Dynamics type',
      options: ['Dynamo', 'Blaze', 'Tempo', 'Steel', 'Dynamo-Blaze', 'Blaze-Tempo', 'Tempo-Steel', 'Steel-Dynamo'] },
    { name: 'Amplify Stage', dataType: 'SINGLE_OPTIONS', description: 'Stage in the Amplify OS journey',
      options: ['awareness', 'connection', 'trust', 'engagement', 'conversion', 'ascension', 'advocacy'] },
    { name: 'Primary Goal', dataType: 'TEXT', description: 'Their #1 current goal' },
    { name: 'Key Initiative', dataType: 'TEXT', description: 'Which key initiative they are aligned to' },
    { name: 'Intelligence Score', dataType: 'NUMERICAL', description: 'Quan profile completeness 0-100' },
    { name: 'Last Synced At', dataType: 'DATE', description: 'Last sync timestamp from Supabase' },
    { name: 'Quan Profile URL', dataType: 'TEXT', description: 'Deep link to their Quan Connect profile' },
  ],
  [QUAN_SCHEMA_KEYS.BRAND]: [
    { name: 'Personal Brand Bio', dataType: 'LARGE_TEXT', description: '2-3 sentence personal brand statement' },
    { name: 'Company Tagline', dataType: 'TEXT', description: 'Company brand tagline' },
    { name: 'Primary Product', dataType: 'TEXT', description: 'Flagship offer or product name' },
    { name: 'Target Audience', dataType: 'LARGE_TEXT', description: 'Ideal customer profile description' },
    { name: 'Content Voice', dataType: 'SINGLE_OPTIONS', description: 'Brand voice style',
      options: ['Professional', 'Conversational', 'Bold', 'Nurturing', 'Educational', 'Inspirational'] },
    { name: 'Brand Color Primary', dataType: 'TEXT', description: 'Primary brand color (hex, e.g. #2D6FF4)' },
    { name: 'Brand Color Secondary', dataType: 'TEXT', description: 'Secondary brand color (hex)' },
    { name: 'AI Studio App URL', dataType: 'TEXT', description: 'URL of their deployed AI Studio partner dashboard app' },
    { name: 'Last Synced At', dataType: 'DATE', description: 'Last sync timestamp from Supabase' },
  ],
  [QUAN_SCHEMA_KEYS.SESSION]: [
    { name: 'Session Date', dataType: 'DATE', description: 'Date of the session' },
    { name: 'Session Type', dataType: 'SINGLE_OPTIONS', description: 'Type of session',
      options: ['Flow School', 'Genius Group', '1on1 Coaching', 'Mastermind', 'Workshop', 'Check-in'] },
    { name: 'Key Insight', dataType: 'LARGE_TEXT', description: 'Main breakthrough or insight from the session' },
    { name: 'Action Items', dataType: 'LARGE_TEXT', description: 'Action items from the session (one per line)' },
    { name: 'Breakthrough Level', dataType: 'NUMERICAL', description: 'Session breakthrough rating 1-10' },
    { name: 'Genius Mission Unlocked', dataType: 'TEXT', description: 'Which genius mission was unlocked this session' },
    { name: 'Facilitator Name', dataType: 'TEXT', description: 'Name of the facilitator or coach' },
    { name: 'Contact GHL ID', dataType: 'TEXT', description: 'GHL contact ID for association lookup' },
  ],
} as const;

// ─── Tool Params ─────────────────────────────────────────────────────────────

export interface MCPProvisionQuanPartnerSchemaParams {
  locationId?: string;
  partnerName?: string;
  personalBrandBio?: string;
  createKnowledgeBase?: boolean;
  createConversationAIAgent?: boolean;
  skipIfExists?: boolean;
}

export interface MCPGetQuanSchemaStatusParams {
  locationId?: string;
}

export interface MCPSyncQuanIntelligenceToGHLParams {
  locationId?: string;
  contactGhlId: string;
  quanData: {
    quanContactId?: string;
    wealthDynamicsProfile?: string;
    geniusType?: string;
    amplifyStage?: string;
    primaryGoal?: string;
    keyInitiative?: string;
    intelligenceScore?: number;
    quanProfileUrl?: string;
  };
}

// ─── Tool Class ───────────────────────────────────────────────────────────────

export class QuanProvisioningTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'provision_quan_partner_schema',
        description: [
          'One-shot: deploy the full Quan Intelligence layer to a GHL partner sub-account.',
          'Creates 3 custom object schemas (quan_profile, quan_brand, quan_session) with all fields,',
          'optionally creates a Quan Knowledge Base and Conversation AI agent.',
          'Idempotent — safe to run multiple times (skipIfExists: true by default).',
          'Use this as the first step when onboarding a new partner to Amplify OS.',
        ].join(' '),
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL location ID (uses default if not provided)' },
            partnerName: { type: 'string', description: 'Partner display name (used in KB and agent names)' },
            personalBrandBio: { type: 'string', description: 'Seed value for the partner brand bio field' },
            createKnowledgeBase: { type: 'boolean', description: 'Create a Quan Knowledge Base (default: true)', default: true },
            createConversationAIAgent: { type: 'boolean', description: 'Create a Quan Conversation AI agent (default: true)', default: true },
            skipIfExists: { type: 'boolean', description: 'Skip schema creation if already exists (default: true)', default: true },
          },
          required: [],
          additionalProperties: false,
        },
      },
      {
        name: 'get_quan_schema_status',
        description: 'Check which Quan Intelligence custom object schemas are deployed on a partner sub-account. Returns status of quan_profile, quan_brand, quan_session objects.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL location ID (uses default if not provided)' },
          },
          required: [],
          additionalProperties: false,
        },
      },
      {
        name: 'sync_quan_intelligence_to_ghl',
        description: [
          'Sync Quan intelligence data from Supabase to a GHL contact\'s quan_profile record.',
          'Creates the record if it does not exist, updates if it does.',
          'Call this whenever Supabase master_contacts data changes for a partner contact.',
        ].join(' '),
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL location ID (uses default if not provided)' },
            contactGhlId: { type: 'string', description: 'GHL contact ID to link the quan_profile record to' },
            quanData: {
              type: 'object',
              description: 'Quan intelligence fields to sync',
              properties: {
                quanContactId: { type: 'string', description: 'Supabase master_contacts UUID' },
                wealthDynamicsProfile: { type: 'string', description: 'WD archetype (Creator, Mechanic, etc.)' },
                geniusType: { type: 'string', description: 'Genius type (Dynamo, Blaze, Tempo, Steel, or blend)' },
                amplifyStage: { type: 'string', description: 'Amplify OS stage (awareness → advocacy)' },
                primaryGoal: { type: 'string', description: 'Their #1 current goal' },
                keyInitiative: { type: 'string', description: 'Key initiative they are aligned to' },
                intelligenceScore: { type: 'number', description: 'Profile completeness score 0-100', minimum: 0, maximum: 100 },
                quanProfileUrl: { type: 'string', description: 'Deep link to their Quan Connect profile' },
              },
            },
          },
          required: ['contactGhlId', 'quanData'],
          additionalProperties: false,
        },
      },
      {
        name: 'create_quan_session_record',
        description: 'Log a coaching or group session to GHL as a quan_session custom object record. Links to a contact for pipeline visibility.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL location ID (uses default if not provided)' },
            sessionTitle: { type: 'string', description: 'Session title (e.g. "Flow School Week 3 — Sky Fresh")' },
            contactGhlId: { type: 'string', description: 'GHL contact ID to associate this session with' },
            sessionDate: { type: 'string', description: 'ISO date string (e.g. "2026-04-05")' },
            sessionType: { type: 'string', enum: ['Flow School', 'Genius Group', '1on1 Coaching', 'Mastermind', 'Workshop', 'Check-in'] },
            keyInsight: { type: 'string', description: 'Main breakthrough or insight' },
            actionItems: { type: 'string', description: 'Action items (one per line)' },
            breakthroughLevel: { type: 'number', description: 'Breakthrough rating 1-10', minimum: 1, maximum: 10 },
            geniusMissionUnlocked: { type: 'string', description: 'Which genius mission was unlocked' },
            facilitatorName: { type: 'string', description: 'Facilitator or coach name' },
          },
          required: ['sessionTitle', 'contactGhlId'],
          additionalProperties: false,
        },
      },
      {
        name: 'update_quan_brand_config',
        description: 'Create or update the Quan Brand Config record for a partner sub-account. One record per location — stores personal/company/product brand intelligence.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'GHL location ID (uses default if not provided)' },
            brandName: { type: 'string', description: 'The partner\'s primary brand name (personal or company)' },
            personalBrandBio: { type: 'string', description: '2-3 sentence personal brand statement' },
            companyTagline: { type: 'string', description: 'Company brand tagline' },
            primaryProduct: { type: 'string', description: 'Flagship offer or product name' },
            targetAudience: { type: 'string', description: 'Ideal customer profile description' },
            contentVoice: { type: 'string', enum: ['Professional', 'Conversational', 'Bold', 'Nurturing', 'Educational', 'Inspirational'] },
            brandColorPrimary: { type: 'string', description: 'Primary brand color hex (e.g. #2D6FF4)' },
            brandColorSecondary: { type: 'string', description: 'Secondary brand color hex' },
            aiStudioAppUrl: { type: 'string', description: 'URL of their deployed AI Studio partner dashboard app' },
          },
          required: ['brandName'],
          additionalProperties: false,
        },
      },
    ];
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const locationId = (params.locationId as string) || this.apiClient.getConfig().locationId;

    switch (name) {
      case 'provision_quan_partner_schema':
        return this.provisionQuanPartnerSchema({ ...params, locationId } as MCPProvisionQuanPartnerSchemaParams);

      case 'get_quan_schema_status':
        return this.getQuanSchemaStatus({ locationId });

      case 'sync_quan_intelligence_to_ghl':
        return this.syncQuanIntelligenceToGHL({ ...params, locationId } as MCPSyncQuanIntelligenceToGHLParams);

      case 'create_quan_session_record':
        return this.createQuanSessionRecord(params, locationId);

      case 'update_quan_brand_config':
        return this.updateQuanBrandConfig(params, locationId);

      default:
        throw new Error(`Unknown Quan provisioning tool: ${name}`);
    }
  }

  // ─── Private Implementation ─────────────────────────────────────────────────

  private async provisionQuanPartnerSchema(params: MCPProvisionQuanPartnerSchemaParams): Promise<object> {
    const locationId = params.locationId || this.apiClient.getConfig().locationId;
    const partnerName = params.partnerName || 'Partner';
    const skipIfExists = params.skipIfExists !== false;
    const createKB = params.createKnowledgeBase !== false;
    const createAgent = params.createConversationAIAgent !== false;

    const report: Record<string, any> = {
      locationId,
      partnerName,
      schemas: {},
      knowledgeBase: null,
      conversationAIAgent: null,
      errors: [],
    };

    // 1. Get existing objects to check for idempotency
    let existingKeys: Set<string> = new Set();
    try {
      const existing = await this.apiClient.getObjectsByLocation(locationId);
      if (existing.data?.objects) {
        existingKeys = new Set(existing.data.objects.map((o: any) => o.key));
      }
    } catch (e) {
      report.errors.push(`Could not fetch existing objects: ${e}`);
    }

    // 2. Create each schema + fields
    const schemaDefs = [
      {
        key: QUAN_SCHEMA_KEYS.PROFILE,
        singular: 'Quan Profile',
        plural: 'Quan Profiles',
        description: 'Quan Intelligence profile — WD type, genius, stage, goals. Synced from Supabase.',
        primaryDisplay: { key: 'custom_objects.quan_profile.display_name', name: 'Display Name', dataType: 'TEXT' as const },
      },
      {
        key: QUAN_SCHEMA_KEYS.BRAND,
        singular: 'Quan Brand Config',
        plural: 'Quan Brand Configs',
        description: 'Partner brand intelligence — personal/company/product brand config. One per location.',
        primaryDisplay: { key: 'custom_objects.quan_brand.brand_name', name: 'Brand Name', dataType: 'TEXT' as const },
      },
      {
        key: QUAN_SCHEMA_KEYS.SESSION,
        singular: 'Quan Session',
        plural: 'Quan Sessions',
        description: 'Session/coaching interaction log — insights, action items, breakthroughs.',
        primaryDisplay: { key: 'custom_objects.quan_session.session_title', name: 'Session Title', dataType: 'TEXT' as const },
      },
    ];

    // Pre-fetch existing object IDs so we can add fields to already-deployed schemas
    const existingObjectIdMap: Record<string, string> = {};
    try {
      const allObjs = await this.apiClient.getObjectsByLocation(locationId);
      if (allObjs.data?.objects) {
        for (const obj of allObjs.data.objects) {
          existingObjectIdMap[obj.key] = obj.id;
        }
      }
    } catch {}

    for (const def of schemaDefs) {
      let objectId: string | undefined;

      if (skipIfExists && existingKeys.has(def.key)) {
        // Schema exists — fetch the folder ID so we can still add missing fields
        let folderId = existingObjectIdMap[def.key]; // fallback to objectId
        try {
          const fieldsResp = await this.apiClient.getCustomFieldsV2ByObjectKey({ objectKey: def.key, locationId });
          const autoFolder = fieldsResp.data?.folders?.[0];
          if (autoFolder?.id) folderId = autoFolder.id;
        } catch {}
        objectId = folderId;
        report.schemas[def.key] = { status: 'exists', objectId: existingObjectIdMap[def.key], folderId: objectId };
      } else {
        try {
          const schemaResp = await this.apiClient.createObjectSchema({
            labels: { singular: def.singular, plural: def.plural },
            key: def.key,
            description: def.description,
            locationId,
            primaryDisplayPropertyDetails: def.primaryDisplay,
          });

          if (!schemaResp.success) throw new Error(schemaResp.error?.message || 'Schema creation failed');

          objectId = schemaResp.data?.object?.id;
          report.schemas[def.key] = { status: 'created', objectId };

          // Fetch the auto-created folder ID (GHL creates a default folder per schema)
          await new Promise(r => setTimeout(r, 500)); // brief pause for GHL to create folder
          try {
            const fieldsResp = await this.apiClient.getCustomFieldsV2ByObjectKey({ objectKey: def.key, locationId });
            const autoFolder = fieldsResp.data?.folders?.[0];
            if (autoFolder?.id) objectId = autoFolder.id; // use folder ID as parentId
          } catch {}
        } catch (e) {
          report.schemas[def.key] = { status: 'error', error: String(e) };
          report.errors.push(`Schema ${def.key} failed: ${e}`);
          continue;
        }
      }

      if (!objectId) {
        report.schemas[def.key].fieldsNote = 'Skipped field creation — objectId not available';
        continue;
      }

      // Add fields to this schema
      const fields = QUAN_FIELD_DEFS[def.key as keyof typeof QUAN_FIELD_DEFS];
      const fieldResults: any[] = [];

      for (const field of fields) {
        try {
          const fieldSnakeKey = field.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
          const fieldKey = `${def.key}.${fieldSnakeKey}`;

          const fieldPayload: any = {
            locationId,
            name: field.name,
            dataType: field.dataType,
            description: field.description,
            objectKey: def.key,
            fieldKey,
            parentId: objectId,
            showInForms: true,
          };

          if ('options' in field && field.options) {
            fieldPayload.options = (field.options as readonly string[]).map((opt: string) => ({
              key: opt.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
              label: opt,
            }));
          }

          const fieldResp = await this.apiClient.createCustomFieldV2(fieldPayload);
          fieldResults.push({ name: field.name, status: 'created', id: fieldResp.data?.field?.id });
        } catch (fe) {
          fieldResults.push({ name: field.name, status: 'error', error: String(fe) });
        }
      }

      report.schemas[def.key].fields = fieldResults;
    }

    // 4. Create Quan Knowledge Base
    if (createKB) {
      try {
        const kbResp = await this.apiClient.createKnowledgeBase({
          locationId,
          name: `Quan Intelligence — ${partnerName}`,
          description: `Quan Intelligence KB for ${partnerName}. Contains brand config, partner goals, WD profile, and session insights.`,
        });
        report.knowledgeBase = {
          status: 'created',
          id: kbResp.data?.id,
          name: kbResp.data?.name,
        };

        // 5. Create Conversation AI Agent attached to KB
        if (createAgent && kbResp.data?.id) {
          try {
            const agentResp = await this.apiClient.createConversationAIAgent({
              name: `Quan AI — ${partnerName}`,
              personality: 'Knowledgeable, warm, aligned with Quan principles and quantum laminar flow',
              goal: `Help ${partnerName}'s contacts understand their Quan Intelligence profile, answer questions about their goals and Amplify stage, and book discovery calls.`,
              instructions: `You are the Quan AI assistant for ${partnerName}. You have access to their knowledge base. Always reference their Wealth Dynamics profile and current Amplify stage when relevant. Guide contacts to their next step in the journey. Be concise, insightful, and action-oriented.`,
              businessName: partnerName,
              mode: 'suggestive',
              channels: ['Live_Chat', 'WebChat'],
              knowledgeBaseIds: [kbResp.data.id],
              isPrimary: false,
              waitTime: 2,
              waitTimeUnit: 'seconds',
              autoPilotMaxMessages: 20,
            });
            report.conversationAIAgent = {
              status: 'created',
              id: agentResp.data?.id,
              name: agentResp.data?.name,
            };
          } catch (ae) {
            report.conversationAIAgent = { status: 'error', error: String(ae) };
          }
        }
      } catch (ke) {
        report.knowledgeBase = { status: 'error', error: String(ke) };
      }
    }

    report.summary = {
      schemasCreated: Object.values(report.schemas).filter((s: any) => s.status === 'created').length,
      schemasSkipped: Object.values(report.schemas).filter((s: any) => s.status === 'skipped').length,
      errors: report.errors.length,
      readyForSync: report.errors.length === 0,
    };

    return report;
  }

  private async getQuanSchemaStatus(params: { locationId?: string }): Promise<object> {
    const locationId = params.locationId || this.apiClient.getConfig().locationId;

    try {
      const resp = await this.apiClient.getObjectsByLocation(locationId);
      const objects = resp.data?.objects || [];

      const quanObjects = objects.filter((o: any) =>
        Object.values(QUAN_SCHEMA_KEYS).includes(o.key)
      );

      const status: Record<string, any> = {};
      for (const key of Object.values(QUAN_SCHEMA_KEYS)) {
          const found = quanObjects.find((o: any) => o.key === key);
          status[key] = found
            ? { deployed: true, id: found.id, fieldCount: (found as any).fieldCount || 0 }
          : { deployed: false };
      }

      return {
        locationId,
        quanSchemaStatus: status,
        allDeployed: Object.values(status).every((s: any) => s.deployed),
        message: Object.values(status).every((s: any) => s.deployed)
          ? 'All 3 Quan Intelligence schemas are deployed on this location.'
          : 'Some Quan schemas are missing. Run provision_quan_partner_schema to deploy.',
      };
    } catch (e) {
      throw new Error(`Failed to get Quan schema status: ${e}`);
    }
  }

  private async syncQuanIntelligenceToGHL(params: MCPSyncQuanIntelligenceToGHLParams): Promise<object> {
    const locationId = params.locationId || this.apiClient.getConfig().locationId;
    const { contactGhlId, quanData } = params;

    // Search for existing quan_profile record for this contact
    let existingRecordId: string | null = null;
    try {
      const searchResp = await this.apiClient.searchObjectRecords(QUAN_SCHEMA_KEYS.PROFILE, {
        locationId,
        query: `contact_ghl_id:${contactGhlId}`,
        page: 1,
        pageLimit: 1,
        searchAfter: [],
      });
      const records = searchResp.data?.records;
      if (records && records.length > 0) {
        existingRecordId = records[0].id;
      }
    } catch {
      // No existing record — will create
    }

    const properties: Record<string, any> = {
      display_name: `Quan Profile — ${contactGhlId}`,
      contact_ghl_id: contactGhlId,
      last_synced_at: new Date().toISOString().split('T')[0],
    };
    if (quanData.quanContactId) properties['quan_contact_id'] = quanData.quanContactId;
    if (quanData.wealthDynamicsProfile) properties['wealth_dynamics_profile'] = quanData.wealthDynamicsProfile;
    if (quanData.geniusType) properties['genius_type'] = quanData.geniusType;
    if (quanData.amplifyStage) properties['amplify_stage'] = quanData.amplifyStage;
    if (quanData.primaryGoal) properties['primary_goal'] = quanData.primaryGoal;
    if (quanData.keyInitiative) properties['key_initiative'] = quanData.keyInitiative;
    if (quanData.intelligenceScore !== undefined) properties['intelligence_score'] = quanData.intelligenceScore;
    if (quanData.quanProfileUrl) properties['quan_profile_url'] = quanData.quanProfileUrl;

    try {
      if (existingRecordId) {
        const resp = await this.apiClient.updateObjectRecord(QUAN_SCHEMA_KEYS.PROFILE, existingRecordId, {
          properties,
          locationId,
        });
        return { success: true, action: 'updated', recordId: existingRecordId, contactGhlId };
      } else {
        const resp = await this.apiClient.createObjectRecord(QUAN_SCHEMA_KEYS.PROFILE, {
          properties,
          locationId,
        });
        return { success: true, action: 'created', recordId: resp.data?.record?.id, contactGhlId };
      }
    } catch (e) {
      throw new Error(`Failed to sync Quan intelligence to GHL: ${e}`);
    }
  }

  private async createQuanSessionRecord(params: Record<string, unknown>, locationId: string): Promise<object> {
    const properties: Record<string, any> = {
      session_title: params.sessionTitle as string,
      contact_ghl_id: params.contactGhlId as string,
    };
    if (params.sessionDate) properties['session_date'] = params.sessionDate;
    if (params.sessionType) properties['session_type'] = params.sessionType;
    if (params.keyInsight) properties['key_insight'] = params.keyInsight;
    if (params.actionItems) properties['action_items'] = params.actionItems;
    if (params.breakthroughLevel !== undefined) properties['breakthrough_level'] = params.breakthroughLevel;
    if (params.geniusMissionUnlocked) properties['genius_mission_unlocked'] = params.geniusMissionUnlocked;
    if (params.facilitatorName) properties['facilitator_name'] = params.facilitatorName;

    const resp = await this.apiClient.createObjectRecord(QUAN_SCHEMA_KEYS.SESSION, {
      properties,
      locationId,
    });

    return {
      success: true,
      recordId: resp.data?.record?.id,
      sessionTitle: params.sessionTitle,
      message: `Session logged to GHL as quan_session record`,
    };
  }

  private async updateQuanBrandConfig(params: Record<string, unknown>, locationId: string): Promise<object> {
    // Search for existing brand config for this location
    let existingRecordId: string | null = null;
    try {
      const searchResp = await this.apiClient.searchObjectRecords(QUAN_SCHEMA_KEYS.BRAND, {
        locationId,
        query: `brand_name:${params.brandName}`,
        page: 1,
        pageLimit: 1,
        searchAfter: [],
      });
      const searchRecords = searchResp.data?.records;
      if (searchRecords && searchRecords.length > 0) {
        existingRecordId = searchRecords[0].id;
      }
    } catch {
      // No existing record
    }

    const properties: Record<string, any> = {
      brand_name: params.brandName as string,
      last_synced_at: new Date().toISOString().split('T')[0],
    };
    if (params.personalBrandBio) properties['personal_brand_bio'] = params.personalBrandBio;
    if (params.companyTagline) properties['company_tagline'] = params.companyTagline;
    if (params.primaryProduct) properties['primary_product'] = params.primaryProduct;
    if (params.targetAudience) properties['target_audience'] = params.targetAudience;
    if (params.contentVoice) properties['content_voice'] = params.contentVoice;
    if (params.brandColorPrimary) properties['brand_color_primary'] = params.brandColorPrimary;
    if (params.brandColorSecondary) properties['brand_color_secondary'] = params.brandColorSecondary;
    if (params.aiStudioAppUrl) properties['ai_studio_app_url'] = params.aiStudioAppUrl;

    if (existingRecordId) {
      await this.apiClient.updateObjectRecord(QUAN_SCHEMA_KEYS.BRAND, existingRecordId, { properties, locationId });
      return { success: true, action: 'updated', recordId: existingRecordId, brandName: params.brandName };
    } else {
      const resp = await this.apiClient.createObjectRecord(QUAN_SCHEMA_KEYS.BRAND, { properties, locationId });
      return { success: true, action: 'created', recordId: resp.data?.record?.id, brandName: params.brandName };
    }
  }
}

export function isQuanProvisioningTool(name: string): boolean {
  return [
    'provision_quan_partner_schema',
    'get_quan_schema_status',
    'sync_quan_intelligence_to_ghl',
    'create_quan_session_record',
    'update_quan_brand_config',
  ].includes(name);
}
