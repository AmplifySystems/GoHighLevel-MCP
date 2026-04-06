/**
 * MCP Email Tools for GoHighLevel Integration
 * Exposes email campaign and template management capabilities to the MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';
import {
  MCPGetEmailCampaignsParams,
  MCPCreateEmailTemplateParams,
  MCPGetEmailTemplatesParams,
  MCPUpdateEmailTemplateParams,
  MCPDeleteEmailTemplateParams,
  GHLEmailCampaign,
  GHLEmailTemplate
} from '../types/ghl-types.js';
import { buildSimpleEmailHtml } from '../utils/simple-email-html.js';

/**
 * Email Tools Class
 * Implements MCP tools for email campaigns and templates
 */
export class EmailTools {
  constructor(private ghlClient: GHLApiClient) {}

  /**
   * Get all email tool definitions for MCP server
   */
  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'get_email_campaigns',
        description: 'Get a list of email campaigns from GoHighLevel.',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter campaigns by status.',
              enum: ['active', 'pause', 'complete', 'cancelled', 'retry', 'draft', 'resend-scheduled'],
              default: 'active'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of campaigns to return.',
              default: 10
            },
            offset: {
              type: 'number',
              description: 'Number of campaigns to skip for pagination.',
              default: 0
            }
          }
        }
      },
      {
        name: 'create_email_template',
        description:
          'Create a new email template in GoHighLevel (POST /emails/builder). For readable campaign mail, call render_simple_email_html first and pass the result as html. Optional subjectLine/previewText are forwarded when the API accepts them.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the new template.'
            },
            html: {
              type: 'string',
              description: 'HTML content of the template.'
            },
            isPlainText: {
              type: 'boolean',
              description: 'Whether the template is plain text.',
              default: false
            },
            subjectLine: {
              type: 'string',
              description: 'Optional default subject line for the template.'
            },
            previewText: {
              type: 'string',
              description: 'Optional inbox preview / preheader text.'
            }
          },
          required: ['title', 'html']
        }
      },
      {
        name: 'render_simple_email_html',
        description:
          'Build minimal, mobile-safe HTML (~18px body, Verdana, single column) for Hidden Profit / workflow emails. Preserves GHL merge tags in body when bodyIsPlainText is false. Does not call GHL — use output as html in create_email_template.',
        inputSchema: {
          type: 'object',
          properties: {
            body: {
              type: 'string',
              description:
                'Inner HTML (paragraphs, merge tags) or plain text if bodyIsPlainText is true.'
            },
            bodyIsPlainText: {
              type: 'boolean',
              description: 'If true, body is escaped and line breaks become <br/>.',
              default: false
            },
            fontSizePx: {
              type: 'number',
              description: 'Body font size in pixels (default 18).',
              default: 18
            },
            maxWidthPx: {
              type: 'number',
              description: 'Max content width (default 640).',
              default: 640
            },
            lineHeight: {
              type: 'number',
              description: 'Unitless line height (default 1.55).',
              default: 1.55
            }
          },
          required: ['body']
        }
      },
      {
        name: 'get_email_templates',
        description: 'Get a list of email templates from GoHighLevel.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of templates to return.',
              default: 10
            },
            offset: {
              type: 'number',
              description: 'Number of templates to skip for pagination.',
              default: 0
            }
          }
        }
      },
      {
        name: 'update_email_template',
        description: 'Update an existing email template in GoHighLevel.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'The ID of the template to update.'
            },
            html: {
              type: 'string',
              description: 'The updated HTML content of the template.'
            },
            previewText: {
              type: 'string',
              description: 'The updated preview text for the template.'
            }
          },
          required: ['templateId', 'html']
        }
      },
      {
        name: 'delete_email_template',
        description: 'Delete an email template from GoHighLevel.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'The ID of the template to delete.'
            }
          },
          required: ['templateId']
        }
      }
    ];
  }

  /**
   * Execute email tool based on tool name and arguments
   */
  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_email_campaigns':
        return this.getEmailCampaigns(args as MCPGetEmailCampaignsParams);
      case 'create_email_template':
        return this.createEmailTemplate(args as MCPCreateEmailTemplateParams);
      case 'render_simple_email_html':
        return this.renderSimpleEmailHtml(args);
      case 'get_email_templates':
        return this.getEmailTemplates(args as MCPGetEmailTemplatesParams);
      case 'update_email_template':
        return this.updateEmailTemplate(args as MCPUpdateEmailTemplateParams);
      case 'delete_email_template':
        return this.deleteEmailTemplate(args as MCPDeleteEmailTemplateParams);
      default:
        throw new Error(`Unknown email tool: ${name}`);
    }
  }

  private async getEmailCampaigns(params: MCPGetEmailCampaignsParams): Promise<{ success: boolean; campaigns: GHLEmailCampaign[]; total: number; message: string }> {
    try {
      const response = await this.ghlClient.getEmailCampaigns(params);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get email campaigns.');
      }
      return {
        success: true,
        campaigns: response.data.schedules,
        total: response.data.total,
        message: `Successfully retrieved ${response.data.schedules.length} email campaigns.`
      };
    } catch (error) {
      throw new Error(`Failed to get email campaigns: ${error}`);
    }
  }

  private renderSimpleEmailHtml(args: {
    body: string;
    bodyIsPlainText?: boolean;
    fontSizePx?: number;
    maxWidthPx?: number;
    lineHeight?: number;
  }): { html: string; message: string } {
    const html = buildSimpleEmailHtml(args.body, {
      bodyIsPlainText: args.bodyIsPlainText,
      fontSizePx: args.fontSizePx,
      maxWidthPx: args.maxWidthPx,
      lineHeight: args.lineHeight
    });
    return {
      html,
      message: 'Pass this html string to create_email_template. Merge tags were preserved if bodyIsPlainText was false.'
    };
  }

  private async createEmailTemplate(params: MCPCreateEmailTemplateParams): Promise<{ success: boolean; template: any; message: string }> {
    try {
      const response = await this.ghlClient.createEmailTemplate(params);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create email template.');
      }
      return {
        success: true,
        template: response.data,
        message: `Successfully created email template.`
      };
    } catch (error) {
      throw new Error(`Failed to create email template: ${error}`);
    }
  }

  private async getEmailTemplates(params: MCPGetEmailTemplatesParams): Promise<{ success: boolean; templates: GHLEmailTemplate[]; message: string }> {
    try {
      const response = await this.ghlClient.getEmailTemplates(params);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get email templates.');
      }
      return {
        success: true,
        templates: response.data,
        message: `Successfully retrieved ${response.data.length} email templates.`
      };
    } catch (error) {
      throw new Error(`Failed to get email templates: ${error}`);
    }
  }

  private async updateEmailTemplate(params: MCPUpdateEmailTemplateParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.updateEmailTemplate(params);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update email template.');
      }
      return {
        success: true,
        message: 'Successfully updated email template.'
      };
    } catch (error) {
      throw new Error(`Failed to update email template: ${error}`);
    }
  }

  private async deleteEmailTemplate(params: MCPDeleteEmailTemplateParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.ghlClient.deleteEmailTemplate(params);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete email template.');
      }
      return {
        success: true,
        message: 'Successfully deleted email template.'
      };
    } catch (error) {
      throw new Error(`Failed to delete email template: ${error}`);
    }
  }
} 