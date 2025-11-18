import { z } from 'zod';
import { invokeMcpTool } from '../mcpClient';

export const s3Tools = {
  create_s3_bucket: {
    description: 'Create an S3 bucket via AWS MCP',
    parameters: z.object({
      bucketName: z.string(),
      region: z.string(),
    }),
    async execute({ bucketName, region }: { bucketName: string; region: string }) {
      return await invokeMcpTool('create_s3_bucket', { bucketName, region });
    },
  },

  list_s3_buckets: {
    description: 'List S3 buckets',
    parameters: z.object({}),
    async execute() {
      return await invokeMcpTool('list_s3_buckets', {});
    },
  },
};
