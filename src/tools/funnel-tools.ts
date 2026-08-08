/**
 * Funnel Tools for GoHighLevel MCP Server
 * Covers the current v3 Funnels API plus convenience catalog helpers.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

const EDIT_URL_BASE = 'https://app.amplifysystems.io/v2/location';

interface FunnelQueryParams {
  locationId?: string;
  funnelId?: string;
  limit?: number;
  offset?: number;
  skip?: number;
  query?: string;
  search?: string;
  type?: string;
  onlyWithMappedDomain?: boolean;
  [key: string]: unknown;
}

interface FunnelLike {
  id?: string;
  _id?: string;
  name?: string;
  locationId?: string;
  domainId?: string;
  [key: string]: unknown;
}

interface FunnelPageLike {
  id?: string;
  stepId?: string;
  siteId?: string;
  name?: string;
  slug?: string;
  url?: string;
  [key: string]: unknown;
}

function getItems(data: unknown, keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  const nested = record.data;
  if (nested && typeof nested === 'object') {
    return getItems(nested, keys);
  }

  return [];
}

function getDomainOverridesFromEnv(): Record<string, string> {
  const raw = process.env.GHL_DOMAIN_OVERRIDES_JSON;
  if (!raw || typeof raw !== 'string') return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
}

export class FunnelTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_list_funnels',
        description: 'List funnels and websites for a HighLevel location using GET /funnels/funnel/list (v3). Returns API data plus edit URLs and domain mapping hints.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID. Defaults to the MCP configured location.' },
            limit: { type: 'number', description: 'Optional API page size.' },
            offset: { type: 'number', description: 'Optional API offset.' },
            skip: { type: 'number', description: 'Optional API skip value, if the endpoint version supports it.' },
            query: { type: 'string', description: 'Optional search query, if supported by the endpoint.' },
            search: { type: 'string', description: 'Optional search text, if supported by the endpoint.' },
            type: { type: 'string', description: 'Optional funnel/site type filter, if supported by the endpoint.' }
          },
          additionalProperties: true
        }
      },
      {
        name: 'ghl_list_funnel_pages',
        description: 'List pages for one funnel/website using GET /funnels/page (v3). Use funnelId from ghl_list_funnels.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID. Defaults to the MCP configured location.' },
            funnelId: { type: 'string', description: 'Funnel or website ID.' },
            limit: { type: 'number', description: 'Optional API page size.' },
            offset: { type: 'number', description: 'Optional API offset.' },
            skip: { type: 'number', description: 'Optional API skip value, if the endpoint version supports it.' }
          },
          required: ['funnelId'],
          additionalProperties: true
        }
      },
      {
        name: 'ghl_count_funnel_pages',
        description: 'Count pages for a funnel/website using GET /funnels/page/count (v3).',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID. Defaults to the MCP configured location.' },
            funnelId: { type: 'string', description: 'Funnel or website ID.' }
          },
          required: ['funnelId'],
          additionalProperties: true
        }
      },
      {
        name: 'ghl_list_all_funnel_pages',
        description: 'List every page across all funnels/websites for a location. Useful for public URL cataloging, screenshots, QA, and funnel inventory.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID. Defaults to the MCP configured location.' },
            onlyWithMappedDomain: { type: 'boolean', description: 'Only include funnels with a domainId.', default: false },
            limit: { type: 'number', description: 'Optional page size per funnel.', default: 20 }
          },
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: FunnelQueryParams): Promise<unknown> {
    switch (name) {
      case 'ghl_list_funnels':
        return this.listFunnels(params);
      case 'ghl_list_funnel_pages':
        return this.listFunnelPages(params);
      case 'ghl_count_funnel_pages':
        return this.countFunnelPages(params);
      case 'ghl_list_all_funnel_pages':
        return this.listAllFunnelPages(params);
      default:
        throw new Error(`Unknown funnel tool: ${name}`);
    }
  }

  private async listFunnels(params: FunnelQueryParams): Promise<unknown> {
    const result = await this.apiClient.listFunnels(params);
    if (!result.success || result.data == null) {
      throw new Error(result.error?.message || 'Failed to list funnels');
    }

    const funnels = getItems(result.data, ['funnels', 'items', 'results']) as FunnelLike[];
    const locationId = params.locationId || funnels[0]?.locationId || '';
    const mapped = funnels.map((funnel) => {
      const funnelId = funnel._id || funnel.id || '';
      const domainId = typeof funnel.domainId === 'string' ? funnel.domainId : undefined;
      return {
        ...funnel,
        domainMapped: !!domainId,
        funnelEditUrl: locationId && funnelId ? `${EDIT_URL_BASE}/${locationId}/funnels-websites/funnels/${funnelId}/steps` : ''
      };
    });

    return {
      success: true,
      endpoint: 'GET /funnels/funnel/list',
      total: mapped.length,
      funnels: mapped,
      raw: result.data
    };
  }

  private async listFunnelPages(params: FunnelQueryParams): Promise<unknown> {
    if (!params.funnelId) {
      throw new Error('funnelId is required');
    }

    const result = await this.apiClient.getFunnelPages(params);
    if (!result.success || result.data == null) {
      throw new Error(result.error?.message || 'Failed to list funnel pages');
    }

    const pages = getItems(result.data, ['pages', 'items', 'results']) as FunnelPageLike[];
    return {
      success: true,
      endpoint: 'GET /funnels/page',
      funnelId: params.funnelId,
      total: pages.length,
      pages,
      raw: result.data
    };
  }

  private async countFunnelPages(params: FunnelQueryParams): Promise<unknown> {
    if (!params.funnelId) {
      throw new Error('funnelId is required');
    }

    const result = await this.apiClient.getFunnelPagesCount(params);
    if (!result.success || result.data == null) {
      throw new Error(result.error?.message || 'Failed to count funnel pages');
    }

    return {
      success: true,
      endpoint: 'GET /funnels/page/count',
      funnelId: params.funnelId,
      count: result.data
    };
  }

  private async listAllFunnelPages(params: FunnelQueryParams): Promise<unknown> {
    const funnelsResult = await this.apiClient.listFunnels(params);
    if (!funnelsResult.success || funnelsResult.data == null) {
      throw new Error(funnelsResult.error?.message || 'Failed to list funnels');
    }

    const funnels = getItems(funnelsResult.data, ['funnels', 'items', 'results']) as FunnelLike[];
    const locationId = params.locationId || funnels[0]?.locationId || '';
    const onlyWithMappedDomain = !!params.onlyWithMappedDomain;
    const domainOverrides = getDomainOverridesFromEnv();
    const targetFunnels = onlyWithMappedDomain
      ? funnels.filter((funnel) => typeof funnel.domainId === 'string' && funnel.domainId.trim().length > 0)
      : funnels;

    const rows: Record<string, unknown>[] = [];

    for (const funnel of targetFunnels) {
      const funnelId = funnel._id || funnel.id || '';
      if (!funnelId) continue;

      const pageParams: FunnelQueryParams = {
        locationId,
        funnelId,
        limit: typeof params.limit === 'number' ? params.limit : 20
      };
      const pagesResult = await this.apiClient.getFunnelPages(pageParams);
      const pages = pagesResult.success && pagesResult.data != null
        ? getItems(pagesResult.data, ['pages', 'items', 'results']) as FunnelPageLike[]
        : [];

      const domainId = typeof funnel.domainId === 'string' ? funnel.domainId : undefined;
      const funnelEditUrl = locationId && funnelId ? `${EDIT_URL_BASE}/${locationId}/funnels-websites/funnels/${funnelId}/steps` : '';

      for (const page of pages) {
        const stepId = page.stepId || page.id || '';
        let publicUrl = typeof page.url === 'string' ? page.url : '';
        if (publicUrl.startsWith('/') && domainId && domainOverrides[domainId]) {
          publicUrl = `https://${domainOverrides[domainId].replace(/\/$/, '')}${publicUrl}`;
        }

        rows.push({
          pageName: page.name || page.slug || stepId || 'Unnamed page',
          publicUrl,
          editUrl: stepId ? `${EDIT_URL_BASE}/${locationId}/funnels-websites/funnels/${funnelId}/steps/${stepId}/overview` : '',
          funnelName: funnel.name || funnelId,
          funnelId,
          funnelEditUrl,
          domainMapped: !!domainId,
          domainId,
          stepId,
          siteId: page.siteId,
          slug: page.slug,
          locationId
        });
      }
    }

    return {
      success: true,
      totalFunnels: targetFunnels.length,
      totalPages: rows.length,
      onlyWithMappedDomain: onlyWithMappedDomain || undefined,
      pages: rows
    };
  }
}

export function isFunnelTool(name: string): boolean {
  return [
    'ghl_list_funnels',
    'ghl_list_funnel_pages',
    'ghl_count_funnel_pages',
    'ghl_list_all_funnel_pages'
  ].includes(name);
}
