import z from 'zod';

export const MCPToolsListResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string().or(z.number()),
  result: z.object({
    tools: z.array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        inputSchema: z.object({}).passthrough().optional(), // JSONSchemaなので任意
      }),
    ),
  }),
});
