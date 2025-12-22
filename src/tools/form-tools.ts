/**
 * Form Tools for GoHighLevel MCP Server
 * AmplifyOS Custom Implementation
 * 
 * Provides tools for creating, updating, and managing HighLevel forms
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GHLApiClient } from '../clients/ghl-api-client.js';

export interface MCPCreateFormParams {
  locationId?: string;
  name: string;
  fields: FormField[];
  description?: string;
}

export interface MCPUpdateFormParams {
  formId: string;
  locationId?: string;
  name?: string;
  fields?: FormField[];
  description?: string;
}

export interface MCPGetFormParams {
  formId: string;
  locationId?: string;
}

export interface MCPListFormsParams {
  locationId?: string;
  limit?: number;
  skip?: number;
}

export interface MCPDeleteFormParams {
  formId: string;
  locationId?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'phone';
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For dropdown, checkbox, radio
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export class FormTools {
  constructor(private apiClient: GHLApiClient) {}

  getTools(): Tool[] {
    return [
      {
        name: 'ghl_create_form',
        description: 'Create a new form in GoHighLevel. Forms are used to collect information from contacts through custom fields and validation rules.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'The location ID to create the form for. If not provided, uses the default location from configuration.'
            },
            name: {
              type: 'string',
              description: 'Name of the form (required)'
            },
            fields: {
              type: 'array',
              description: 'Array of form fields to include in the form',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['text', 'textarea', 'dropdown', 'checkbox', 'radio', 'date', 'number', 'email', 'phone']
                  },
                  required: { type: 'boolean' },
                  placeholder: { type: 'string' },
                  options: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  validation: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' },
                      pattern: { type: 'string' }
                    }
                  }
                },
                required: ['name', 'type']
              }
            },
            description: {
              type: 'string',
              description: 'Optional description of the form'
            }
          },
          required: ['name', 'fields'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_update_form',
        description: 'Update an existing form in GoHighLevel. Can update form name, fields, or description.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The ID of the form to update (required)'
            },
            locationId: {
              type: 'string',
              description: 'The location ID. If not provided, uses the default location from configuration.'
            },
            name: {
              type: 'string',
              description: 'Updated form name'
            },
            fields: {
              type: 'array',
              description: 'Updated array of form fields',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['text', 'textarea', 'dropdown', 'checkbox', 'radio', 'date', 'number', 'email', 'phone']
                  },
                  required: { type: 'boolean' },
                  placeholder: { type: 'string' },
                  options: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['name', 'type']
              }
            },
            description: {
              type: 'string',
              description: 'Updated form description'
            }
          },
          required: ['formId'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_get_form',
        description: 'Retrieve details of a specific form by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The ID of the form to retrieve (required)'
            },
            locationId: {
              type: 'string',
              description: 'The location ID. If not provided, uses the default location from configuration.'
            }
          },
          required: ['formId'],
          additionalProperties: false
        }
      },
      {
        name: 'ghl_list_forms',
        description: 'List all forms for a location with pagination support.',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: {
              type: 'string',
              description: 'The location ID to get forms for. If not provided, uses the default location from configuration.'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of forms to return (default: 50)'
            },
            skip: {
              type: 'number',
              description: 'Number of records to skip for pagination (default: 0)'
            }
          },
          additionalProperties: false
        }
      },
      {
        name: 'ghl_delete_form',
        description: 'Delete a form from GoHighLevel. This action cannot be undone.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The ID of the form to delete (required)'
            },
            locationId: {
              type: 'string',
              description: 'The location ID. If not provided, uses the default location from configuration.'
            }
          },
          required: ['formId'],
          additionalProperties: false
        }
      }
    ];
  }

  async executeTool(name: string, params: any): Promise<any> {
    try {
      switch (name) {
        case 'ghl_create_form':
          return await this.createForm(params as MCPCreateFormParams);
        
        case 'ghl_update_form':
          return await this.updateForm(params as MCPUpdateFormParams);
        
        case 'ghl_get_form':
          return await this.getForm(params as MCPGetFormParams);
        
        case 'ghl_list_forms':
          return await this.listForms(params as MCPListFormsParams);
        
        case 'ghl_delete_form':
          return await this.deleteForm(params as MCPDeleteFormParams);
        
        default:
          throw new Error(`Unknown form tool: ${name}`);
      }
    } catch (error) {
      console.error(`Error executing form tool ${name}:`, error);
      throw error;
    }
  }

  // ===== FORM MANAGEMENT TOOLS =====

  /**
   * Create a new form
   */
  private async createForm(params: MCPCreateFormParams): Promise<any> {
    try {
      const locationId = params.locationId || this.apiClient.getLocationId();
      
      if (!locationId) {
        throw new Error('Location ID is required');
      }

      // Call HighLevel API to create form
      // Note: This uses the forms API endpoint
      const result = await this.apiClient.createForm({
        locationId,
        name: params.name,
        fields: params.fields,
        description: params.description
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to create form: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        form: result.data,
        message: `Successfully created form: ${params.name}`,
        metadata: {
          formId: result.data.id,
          formName: result.data.name,
          fieldCount: params.fields.length,
          locationId
        }
      };
    } catch (error) {
      console.error('Error creating form:', error);
      throw new Error(`Failed to create form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing form
   */
  private async updateForm(params: MCPUpdateFormParams): Promise<any> {
    try {
      const locationId = params.locationId || this.apiClient.getLocationId();
      
      if (!locationId) {
        throw new Error('Location ID is required');
      }

      const result = await this.apiClient.updateForm({
        formId: params.formId,
        locationId,
        name: params.name,
        fields: params.fields,
        description: params.description
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to update form: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        form: result.data,
        message: `Successfully updated form: ${params.formId}`,
        metadata: {
          formId: result.data.id,
          formName: result.data.name,
          locationId
        }
      };
    } catch (error) {
      console.error('Error updating form:', error);
      throw new Error(`Failed to update form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get form details
   */
  private async getForm(params: MCPGetFormParams): Promise<any> {
    try {
      const locationId = params.locationId || this.apiClient.getLocationId();
      
      if (!locationId) {
        throw new Error('Location ID is required');
      }

      const result = await this.apiClient.getForm({
        formId: params.formId,
        locationId
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to get form: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        form: result.data,
        message: `Successfully retrieved form: ${params.formId}`,
        metadata: {
          formId: result.data.id,
          formName: result.data.name,
          fieldCount: result.data.fields?.length || 0,
          locationId
        }
      };
    } catch (error) {
      console.error('Error getting form:', error);
      throw new Error(`Failed to get form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all forms
   */
  private async listForms(params: MCPListFormsParams): Promise<any> {
    try {
      const locationId = params.locationId || this.apiClient.getLocationId();
      
      if (!locationId) {
        throw new Error('Location ID is required');
      }

      const result = await this.apiClient.listForms({
        locationId,
        limit: params.limit || 50,
        skip: params.skip || 0
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to list forms: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        forms: result.data.forms || [],
        total: result.data.total || 0,
        message: `Successfully retrieved ${result.data.forms?.length || 0} forms`,
        metadata: {
          totalForms: result.data.total || 0,
          returnedCount: result.data.forms?.length || 0,
          pagination: {
            skip: params.skip || 0,
            limit: params.limit || 50
          },
          locationId
        }
      };
    } catch (error) {
      console.error('Error listing forms:', error);
      throw new Error(`Failed to list forms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a form
   */
  private async deleteForm(params: MCPDeleteFormParams): Promise<any> {
    try {
      const locationId = params.locationId || this.apiClient.getLocationId();
      
      if (!locationId) {
        throw new Error('Location ID is required');
      }

      const result = await this.apiClient.deleteForm({
        formId: params.formId,
        locationId
      });

      if (!result.success) {
        throw new Error(`Failed to delete form: ${result.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        message: `Successfully deleted form: ${params.formId}`,
        metadata: {
          formId: params.formId,
          locationId
        }
      };
    } catch (error) {
      console.error('Error deleting form:', error);
      throw new Error(`Failed to delete form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper function to check if a tool name belongs to form tools
export function isFormTool(toolName: string): boolean {
  const formToolNames = [
    'ghl_create_form',
    'ghl_update_form',
    'ghl_get_form',
    'ghl_list_forms',
    'ghl_delete_form'
  ];
  
  return formToolNames.includes(toolName);
}

