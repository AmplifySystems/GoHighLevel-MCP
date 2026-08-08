/**
 * Affiliate Manager Tools for GoHighLevel MCP Server
 * Covers every public Affiliate Manager endpoint currently documented in v3.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

interface AffiliateManagerParams {
  locationId?: string;
  affiliateId?: string;
  [key: string]: unknown;
}

const passthroughQueryProperties = {
  locationId: {
    type: 'string',
    description: 'Location ID. Defaults to the MCP configured location.'
  },
  limit: {
    type: 'number',
    description: 'Optional API page size, if supported by the endpoint.'
  },
  offset: {
    type: 'number',
    description: 'Optional API offset, if supported by the endpoint.'
  },
  skip: {
    type: 'number',
    description: 'Optional API skip value, if supported by the endpoint.'
  },
  search: {
    type: 'string',
    description: 'Optional search text, if supported by the endpoint.'
  },
  query: {
    type: 'string',
    description: 'Optional query text, if supported by the endpoint.'
  },
  startDate: {
    type: 'string',
    description: 'Optional ISO date filter, if supported by the endpoint.'
  },
  endDate: {
    type: 'string',
    description: 'Optional ISO date filter, if supported by the endpoint.'
  },
  status: {
    type: 'string',
    description: 'Optional status filter, if supported by the endpoint.'
  }
} as const;

export class AffiliateManagerTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_list_affiliates',
        description: 'List Affiliate Manager affiliates for a HighLevel location using GET /affiliate-manager/:locationId/affiliates (v3).',
        inputSchema: {
          type: 'object',
          properties: passthroughQueryProperties,
          additionalProperties: true
        }
      },
      {
        name: 'ghl_get_affiliate',
        description: 'Get one Affiliate Manager affiliate by ID using GET /affiliate-manager/:locationId/affiliates/:affiliateId (v3).',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: passthroughQueryProperties.locationId,
            affiliateId: {
              type: 'string',
              description: 'Affiliate ID.'
            }
          },
          required: ['affiliateId'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_list_affiliate_payouts',
        description: 'List Affiliate Manager payouts for a HighLevel location using GET /affiliate-manager/:locationId/payouts (v3).',
        inputSchema: {
          type: 'object',
          properties: passthroughQueryProperties,
          additionalProperties: true
        }
      },
      {
        name: 'ghl_list_affiliate_commissions',
        description: 'List Affiliate Manager commissions for a HighLevel location using GET /affiliate-manager/:locationId/commissions (v3).',
        inputSchema: {
          type: 'object',
          properties: passthroughQueryProperties,
          additionalProperties: true
        }
      }
    ];
  }

  async executeTool(name: string, params: AffiliateManagerParams): Promise<unknown> {
    switch (name) {
      case 'ghl_list_affiliates':
        return this.listAffiliates(params);
      case 'ghl_get_affiliate':
        return this.getAffiliate(params);
      case 'ghl_list_affiliate_payouts':
        return this.listPayouts(params);
      case 'ghl_list_affiliate_commissions':
        return this.listCommissions(params);
      default:
        throw new Error(`Unknown Affiliate Manager tool: ${name}`);
    }
  }

  private async listAffiliates(params: AffiliateManagerParams): Promise<unknown> {
    const result = await this.apiClient.listAffiliateManagerAffiliates(params);
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to list Affiliate Manager affiliates');
    }

    return {
      success: true,
      endpoint: 'GET /affiliate-manager/:locationId/affiliates',
      data: result.data
    };
  }

  private async getAffiliate(params: AffiliateManagerParams): Promise<unknown> {
    if (!params.affiliateId || typeof params.affiliateId !== 'string') {
      throw new Error('affiliateId is required');
    }

    const result = await this.apiClient.getAffiliateManagerAffiliate(params.affiliateId, params.locationId);
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to get Affiliate Manager affiliate');
    }

    return {
      success: true,
      endpoint: 'GET /affiliate-manager/:locationId/affiliates/:affiliateId',
      affiliateId: params.affiliateId,
      data: result.data
    };
  }

  private async listPayouts(params: AffiliateManagerParams): Promise<unknown> {
    const result = await this.apiClient.listAffiliateManagerPayouts(params);
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to list Affiliate Manager payouts');
    }

    return {
      success: true,
      endpoint: 'GET /affiliate-manager/:locationId/payouts',
      data: result.data
    };
  }

  private async listCommissions(params: AffiliateManagerParams): Promise<unknown> {
    const result = await this.apiClient.listAffiliateManagerCommissions(params);
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to list Affiliate Manager commissions');
    }

    return {
      success: true,
      endpoint: 'GET /affiliate-manager/:locationId/commissions',
      data: result.data
    };
  }
}

export function isAffiliateManagerTool(name: string): boolean {
  return [
    'ghl_list_affiliates',
    'ghl_get_affiliate',
    'ghl_list_affiliate_payouts',
    'ghl_list_affiliate_commissions'
  ].includes(name);
}
