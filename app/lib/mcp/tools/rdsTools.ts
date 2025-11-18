import { z } from 'zod';
import { invokeMcpTool } from '../mcpClient';

export const rdsTools = {
  create_rds_instance: {
    description: 'Create an RDS instance via AWS MCP',
    parameters: z.object({
      dbInstanceIdentifier: z.string(),
      dbInstanceClass: z.string(),
      engine: z.string(),
      masterUsername: z.string(),
      masterUserPassword: z.string(),
      region: z.string(),
    }),
    async execute(params: {
      dbInstanceIdentifier: string;
      dbInstanceClass: string;
      engine: string;
      masterUsername: string;
      masterUserPassword: string;
      region: string;
    }) {
      return await invokeMcpTool('create_rds_instance', params);
    },
  },

  list_rds_instances: {
    description: 'List RDS instances via AWS MCP',
    parameters: z.object({}),
    async execute() {
      return await invokeMcpTool('list_rds_instances', {});
    },
  },
};
