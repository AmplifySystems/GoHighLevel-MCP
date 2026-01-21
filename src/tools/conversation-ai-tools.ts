/**
 * Conversation AI Tools for GoHighLevel MCP Server
 * Amplify OS - AI Agents (24/7 receptionist, appointment bot, lead gen bot)
 * Requires conversation-ai.readonly and conversation-ai.write. Version 2021-04-15.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

export interface MCPCreateConversationAIAgentParams {
  name: string;
  personality: string;
  goal: string;
  instructions: string;
  businessName?: string;
  mode?: 'off' | 'suggestive' | 'auto-pilot';
  channels?: string[];
  knowledgeBaseIds?: string[];
  isPrimary?: boolean;
  waitTime?: number;
  waitTimeUnit?: 'seconds' | 'minutes';
  autoPilotMaxMessages?: number;
  respondToImages?: boolean;
  respondToAudio?: boolean;
}

export interface MCPSearchConversationAIAgentsParams {
  startAfter?: string;
  limit?: number;
  query?: string;
}

export class ConversationAITools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_create_conversation_ai_agent',
        description: 'Create a Conversation AI agent (receptionist, appointment bot, lead gen, etc.). Attach knowledge base IDs to power responses.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Agent name' },
            personality: { type: 'string', description: 'Personality traits' },
            goal: { type: 'string', description: 'Agent goal' },
            instructions: { type: 'string', description: 'Instructions for the agent' },
            businessName: { type: 'string', description: 'Business name' },
            mode: { type: 'string', enum: ['off', 'suggestive', 'auto-pilot'], description: 'off, suggestive, or auto-pilot' },
            channels: { type: 'array', items: { type: 'string' }, description: 'e.g. SMS, Live_Chat, WebChat, WhatsApp, IG, FB' },
            knowledgeBaseIds: { type: 'array', items: { type: 'string' }, description: 'KB IDs to attach' },
            isPrimary: { type: 'boolean', description: 'Primary agent' },
            waitTime: { type: 'number', description: 'Wait before respond (default 2)' },
            waitTimeUnit: { type: 'string', enum: ['seconds', 'minutes'] },
            autoPilotMaxMessages: { type: 'number', description: 'Max messages in auto-pilot (1-100)' },
            respondToImages: { type: 'boolean' },
            respondToAudio: { type: 'boolean' }
          },
          required: ['name', 'personality', 'goal', 'instructions'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_search_conversation_ai_agents',
        description: 'Search Conversation AI agents by name or list with pagination.',
        inputSchema: {
          type: 'object',
          properties: {
            startAfter: { type: 'string', description: 'Agent ID to start after (pagination)' },
            limit: { type: 'number', description: 'Records per page' },
            query: { type: 'string', description: 'Search query (lowercase)' }
          },
          additionalProperties: false
        }
      },
      {
        name: 'ghl_get_conversation_ai_agent',
        description: 'Get a Conversation AI agent by ID (config, actions, knowledge bases).',
        inputSchema: {
          type: 'object',
          properties: { agentId: { type: 'string', description: 'Agent ID' } },
          required: ['agentId'],
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'ghl_create_conversation_ai_agent':
        return (await this.apiClient.createConversationAIAgent({
          name: params.name as string,
          personality: params.personality as string,
          goal: params.goal as string,
          instructions: params.instructions as string,
          businessName: params.businessName as string | undefined,
          mode: params.mode as 'off' | 'suggestive' | 'auto-pilot' | undefined,
          channels: params.channels as string[] | undefined,
          knowledgeBaseIds: params.knowledgeBaseIds as string[] | undefined,
          isPrimary: params.isPrimary as boolean | undefined,
          waitTime: params.waitTime as number | undefined,
          waitTimeUnit: params.waitTimeUnit as 'seconds' | 'minutes' | undefined,
          autoPilotMaxMessages: params.autoPilotMaxMessages as number | undefined,
          respondToImages: params.respondToImages as boolean | undefined,
          respondToAudio: params.respondToAudio as boolean | undefined
        })).data;
      case 'ghl_search_conversation_ai_agents':
        return (await this.apiClient.searchConversationAIAgents({
          startAfter: params.startAfter as string | undefined,
          limit: params.limit as number | undefined,
          query: params.query as string | undefined
        })).data;
      case 'ghl_get_conversation_ai_agent':
        return (await this.apiClient.getConversationAIAgent(params.agentId as string)).data;
      default:
        throw new Error(`Unknown conversation AI tool: ${name}`);
    }
  }
}

export function isConversationAITool(name: string): boolean {
  return ['ghl_create_conversation_ai_agent', 'ghl_search_conversation_ai_agents', 'ghl_get_conversation_ai_agent'].includes(name);
}
