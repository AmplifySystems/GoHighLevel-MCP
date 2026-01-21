/**
 * Knowledge Base Tools for GoHighLevel MCP Server
 * Amplify OS - Conversation AI / AI Agents support
 * Requires KB API (Version 2021-04-15). Scopes: ensure Knowledge Base/Conversation AI in Private Integration.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

export interface MCPListKnowledgeBasesParams {
  locationId?: string;
  query?: string;
  limit?: number;
  lastKnowledgeBaseId?: string;
}

export interface MCPCreateKnowledgeBaseParams {
  locationId?: string;
  name: string;
  description?: string;
}

export interface MCPGetKnowledgeBaseParams {
  knowledgeBaseId: string;
}

export interface MCPCreateKbFaqParams {
  locationId?: string;
  knowledgeBaseId: string;
  question: string;
  answer: string;
}

export class KnowledgeBaseTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_list_knowledge_bases',
        description: 'List knowledge bases for a location (paginated). Used by Conversation AI agents.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID (default: config)' },
            query: { type: 'string', description: 'Search by KB name' },
            limit: { type: 'number', description: 'Max results (default 20)' },
            lastKnowledgeBaseId: { type: 'string', description: 'Pagination cursor' }
          },
          additionalProperties: false
        }
      },
      {
        name: 'ghl_create_knowledge_base',
        description: 'Create a knowledge base (max 15 per location). Add FAQs and content to power AI agents.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID (default: config)' },
            name: { type: 'string', description: 'Name of the knowledge base' },
            description: { type: 'string', description: 'Optional description' }
          },
          required: ['name'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_get_knowledge_base',
        description: 'Get a knowledge base by ID including metadata (FAQs, urls, richText, files, tables).',
        inputSchema: {
          type: 'object',
          properties: {
            knowledgeBaseId: { type: 'string', description: 'Knowledge base ID' }
          },
          required: ['knowledgeBaseId'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_create_kb_faq',
        description: 'Create an FAQ inside a knowledge base. FAQs are used by Conversation AI agents to answer questions.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'string', description: 'Location ID (default: config)' },
            knowledgeBaseId: { type: 'string', description: 'Target knowledge base ID' },
            question: { type: 'string', description: 'FAQ question' },
            answer: { type: 'string', description: 'FAQ answer' }
          },
          required: ['knowledgeBaseId', 'question', 'answer'],
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const loc = (params.locationId as string) || this.apiClient.getConfig().locationId;
    switch (name) {
      case 'ghl_list_knowledge_bases':
        return (await this.apiClient.listKnowledgeBases({
          locationId: loc,
          query: params.query as string | undefined,
          limit: params.limit as number | undefined,
          lastKnowledgeBaseId: params.lastKnowledgeBaseId as string | undefined
        })).data;
      case 'ghl_create_knowledge_base':
        return (await this.apiClient.createKnowledgeBase({
          locationId: loc,
          name: params.name as string,
          description: params.description as string | undefined
        })).data;
      case 'ghl_get_knowledge_base':
        return (await this.apiClient.getKnowledgeBase(params.knowledgeBaseId as string)).data;
      case 'ghl_create_kb_faq':
        return (await this.apiClient.createKbFaq({
          locationId: loc,
          knowledgeBaseId: params.knowledgeBaseId as string,
          question: params.question as string,
          answer: params.answer as string
        })).data;
      default:
        throw new Error(`Unknown knowledge base tool: ${name}`);
    }
  }
}

export function isKnowledgeBaseTool(name: string): boolean {
  return ['ghl_list_knowledge_bases', 'ghl_create_knowledge_base', 'ghl_get_knowledge_base', 'ghl_create_kb_faq'].includes(name);
}
