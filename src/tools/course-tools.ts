/**
 * Course Tools for GoHighLevel MCP Server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

export interface MCPImportCoursesParams {
  body: Record<string, unknown>;
  version?: string;
}

export class CourseTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_import_courses',
        description: 'Import HighLevel Courses through the public v3 endpoint POST /courses/courses-exporter/public/import. Pass the request payload exactly as documented by HighLevel.',
        inputSchema: {
          type: 'object',
          properties: {
            body: {
              type: 'object',
              description: 'Request body for the HighLevel course import endpoint.',
              additionalProperties: true
            },
            version: {
              type: 'string',
              description: 'HighLevel API Version header. Defaults to v3.'
            }
          },
          required: ['body'],
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'ghl_import_courses':
        return this.importCourses(params as unknown as MCPImportCoursesParams);
      default:
        throw new Error(`Unknown course tool: ${name}`);
    }
  }

  private async importCourses(params: MCPImportCoursesParams): Promise<unknown> {
    if (!params.body || typeof params.body !== 'object' || Array.isArray(params.body)) {
      throw new Error('body must be an object matching the HighLevel course import request schema');
    }

    const result = await this.apiClient.importCourses({
      body: params.body,
      version: params.version
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to import courses');
    }

    return {
      success: true,
      endpoint: 'POST /courses/courses-exporter/public/import',
      data: result.data
    };
  }
}

export function isCourseTool(name: string): boolean {
  return ['ghl_import_courses'].includes(name);
}
