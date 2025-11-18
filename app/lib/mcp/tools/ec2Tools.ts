import { z } from 'zod';
import { invokeMcpTool } from '../mcpClient';

export const ec2Tools = {
  create_ec2_instance: {
    description: 'Launch an EC2 instance via AWS MCP',
    parameters: z.object({
      instanceType: z.string(),
      region: z.string(),
    }),
    async execute(params: { instanceType: string; region: string }) {
      return await invokeMcpTool('create_ec2_instance', params);
    },
  },

  list_ec2_instances: {
    description: 'List EC2 instances via AWS MCP',
    parameters: z.object({}),
    async execute() {
      return await invokeMcpTool('list_ec2_instances', {});
    },
  },
};
