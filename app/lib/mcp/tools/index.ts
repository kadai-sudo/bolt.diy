import type { ZodObject, ZodTypeAny } from 'zod';

import { s3Tools } from './s3Tools';
import { ec2Tools } from './ec2Tools';
import { dynamodbTools } from './dynamodbTools';
import { rdsTools } from './rdsTools';

type McpTool = {
  description: string;
  parameters: ZodObject<any> | ZodTypeAny;
  execute: (...args: any[]) => Promise<any>;
};

export const mcpTools: Record<string, McpTool> = {
  ...s3Tools,
  ...ec2Tools,
  ...dynamodbTools,
  ...rdsTools,
};
