/**
 * Generic HighLevel API Tools
 * Constrained to relative paths on the configured HighLevel API base URL.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface MCPApiRequestParams {
  method: HttpMethod;
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  version?: string;
  includeDefaultLocationId?: boolean;
}

export class GenericApiTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_api_request',
        description: 'Call any official HighLevel Marketplace API endpoint on services.leadconnectorhq.com by relative path. Use this for newly published endpoints before a typed MCP tool exists. Authentication is always the configured MCP token; do not pass Authorization headers or absolute URLs.',
        inputSchema: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
              description: 'HTTP method.'
            },
            path: {
              type: 'string',
              description: 'Relative API path, for example /funnels/funnel/list or /courses/courses-exporter/public/import.'
            },
            query: {
              type: 'object',
              description: 'Query parameters.',
              additionalProperties: true
            },
            body: {
              type: 'object',
              description: 'JSON request body for POST/PUT/PATCH requests.',
              additionalProperties: true
            },
            version: {
              type: 'string',
              description: 'Optional HighLevel Version header. Use v3 for current v3 endpoints.'
            },
            includeDefaultLocationId: {
              type: 'boolean',
              description: 'When true or omitted, adds the configured locationId to query parameters unless query.locationId is already set. Set false for agency/company endpoints or endpoints that do not accept locationId.',
              default: true
            }
          },
          required: ['method', 'path'],
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    if (name !== 'ghl_api_request') {
      throw new Error(`Unknown generic API tool: ${name}`);
    }

    const typedParams = params as unknown as MCPApiRequestParams;
    const method = String(typedParams.method || '').toUpperCase() as HttpMethod;
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      throw new Error(`Unsupported HTTP method: ${typedParams.method}`);
    }

    const result = await this.apiClient.requestEndpoint({
      method,
      path: typedParams.path,
      query: typedParams.query,
      body: typedParams.body,
      version: typedParams.version,
      includeDefaultLocationId: typedParams.includeDefaultLocationId
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'HighLevel API request failed');
    }

    return {
      success: true,
      method,
      path: typedParams.path,
      status: result.data?.status,
      data: result.data?.data
    };
  }
}

export function isGenericApiTool(name: string): boolean {
  return name === 'ghl_api_request';
}
