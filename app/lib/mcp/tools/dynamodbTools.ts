import { z } from 'zod';
import { invokeMcpTool } from '../mcpClient';

export const dynamodbTools = {
  list_dynamodb_tables: {
    description: 'List DynamoDB tables via AWS MCP',
    parameters: z.object({}),
    async execute() {
      return await invokeMcpTool('list_dynamodb_tables', {});
    },
  },

  create_dynamodb_table: {
    description: 'Create a DynamoDB table via AWS MCP',
    parameters: z.object({
      tableName: z.string(),
      keyName: z.string(),
    }),
    async execute(params: { tableName: string; keyName: string }) {
      return await invokeMcpTool('create_dynamodb_table', params);
    },
  },
};
