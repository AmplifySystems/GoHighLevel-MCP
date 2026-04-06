/**
 * Pure URL builders for HighLevel (LeadConnector) app links — no API calls.
 * Canonical patterns: docs/amplify-os/GHL-APP-DEEP-LINK-TEMPLATES.md
 */

export type HighlevelAppResource =
  | 'contact_detail'
  | 'contact_detail_v2'
  | 'contact_detail_legacy'
  | 'contacts_list'
  | 'workflow'
  | 'funnel'
  | 'settings_custom_fields'
  | 'settings_custom_values'
  | 'settings_tags'
  | 'conversation';

export interface BuildHighlevelAppUrlArgs {
  /** Default: https://app.amplifysystems.io */
  host?: string;
  locationId: string;
  resource: HighlevelAppResource;
  /** contactId, workflowId, funnelId, conversationId depending on resource */
  id?: string;
}

const DEFAULT_HOST = 'https://app.amplifysystems.io';

function trimHost(h: string): string {
  return h.replace(/\/+$/, '');
}

export function buildHighlevelAppUrl(args: BuildHighlevelAppUrlArgs): {
  url: string;
  resource: HighlevelAppResource;
  notes?: string;
} {
  const host = trimHost(args.host || DEFAULT_HOST);
  const loc = args.locationId.trim();
  if (!loc) {
    throw new Error('locationId is required');
  }

  switch (args.resource) {
    case 'contact_detail':
    case 'contact_detail_v2': {
      const id = (args.id || '').trim();
      if (!id) {
        throw new Error('id (contactId) is required for contact_detail / contact_detail_v2');
      }
      return {
        url: `${host}/v2/location/${loc}/contacts/detail/${id}`,
        resource: args.resource,
        notes:
          'Canonical contact record URL for current LeadConnector / GHL (v2). Use resource contact_detail or contact_detail_v2 — same URL. Do not use contact_detail_legacy for app.amplifysystems.io unless you verify it loads.',
      };
    }
    case 'contact_detail_legacy': {
      const id = (args.id || '').trim();
      if (!id) throw new Error('id (contactId) is required for contact_detail_legacy');
      return {
        url: `${host}/location/${loc}/contacts/detail/${id}`,
        resource: args.resource,
        notes:
          'Legacy path — often does not load on current app.amplifysystems.io; prefer contact_detail (v2).',
      };
    }
    case 'contacts_list':
      return { url: `${host}/v2/location/${loc}/contacts`, resource: args.resource };
    case 'workflow': {
      const id = (args.id || '').trim();
      if (!id) throw new Error('id (workflowId) is required for workflow');
      return {
        url: `${host}/location/${loc}/workflow/${id}`,
        resource: args.resource,
        notes: 'Workflow editor URL; folder is not encoded in path — open folder in UI if needed.',
      };
    }
    case 'funnel': {
      const id = (args.id || '').trim();
      if (!id) throw new Error('id (funnelId) is required for funnel');
      return {
        url: `${host}/v2/location/${loc}/funnels-websites/funnels/${id}`,
        resource: args.resource,
        notes: 'GHL has moved funnel/website navigation across versions; confirm path in-app if 404.',
      };
    }
    case 'settings_custom_fields':
      return {
        url: `${host}/v2/location/${loc}/settings/fields`,
        resource: args.resource,
        notes: 'Contact (and other) custom fields — pick object type in UI.',
      };
    case 'settings_custom_values':
      return {
        url: `${host}/v2/location/${loc}/settings/company`,
        resource: args.resource,
        notes: 'Location "Custom Values" often live under company/business settings; adjust tab in UI.',
      };
    case 'settings_tags':
      return {
        url: `${host}/v2/location/${loc}/settings/tags`,
        resource: args.resource,
      };
    case 'conversation': {
      const id = (args.id || '').trim();
      if (!id) throw new Error('id (conversationId) is required for conversation');
      return {
        url: `${host}/v2/location/${loc}/conversations/conversations/${id}`,
        resource: args.resource,
        notes: 'Conversation paths vary by GHL version; search conversation id in global search if link fails.',
      };
    }
    default:
      throw new Error(`Unsupported resource: ${String(args.resource)}`);
  }
}

export const APP_URL_TOOL_DEFINITIONS = [
  {
    name: 'build_highlevel_app_url',
    description:
      'Build a clickable HighLevel (LeadConnector) app URL for contacts, workflows, funnels, settings (custom fields, custom values, tags), or conversations. No API calls — URL templates only. For contact records use resource contact_detail (v2 path). Legacy contact URLs often fail on current GHL. Doc: docs/amplify-os/GHL-APP-DEEP-LINK-TEMPLATES.md.',
    inputSchema: {
      type: 'object',
      properties: {
        host: {
          type: 'string',
          description: 'Optional. Default https://app.amplifysystems.io',
        },
        locationId: {
          type: 'string',
          description: 'Sub-account location ID',
        },
        resource: {
          type: 'string',
          enum: [
            'contact_detail',
            'contact_detail_v2',
            'contact_detail_legacy',
            'contacts_list',
            'workflow',
            'funnel',
            'settings_custom_fields',
            'settings_custom_values',
            'settings_tags',
            'conversation',
          ],
          description:
            'Which app surface to open. For contacts prefer contact_detail (v2 URL).',
        },
        id: {
          type: 'string',
          description: 'Required for contact_detail*, workflow, funnel, conversation',
        },
      },
      required: ['locationId', 'resource'],
    },
  },
];

const ALLOWED: HighlevelAppResource[] = [
  'contact_detail',
  'contact_detail_v2',
  'contact_detail_legacy',
  'contacts_list',
  'workflow',
  'funnel',
  'settings_custom_fields',
  'settings_custom_values',
  'settings_tags',
  'conversation',
];

export function executeAppUrlTool(
  name: string,
  args: Record<string, unknown>
): ReturnType<typeof buildHighlevelAppUrl> {
  if (name !== 'build_highlevel_app_url') {
    throw new Error(`Unknown app URL tool: ${name}`);
  }
  const resource = args.resource as string;
  if (!ALLOWED.includes(resource as HighlevelAppResource)) {
    throw new Error(`Invalid resource "${resource}". Allowed: ${ALLOWED.join(', ')}`);
  }
  return buildHighlevelAppUrl({
    host: typeof args.host === 'string' ? args.host : undefined,
    locationId: String(args.locationId || ''),
    resource: resource as HighlevelAppResource,
    id: typeof args.id === 'string' ? args.id : undefined,
  });
}
