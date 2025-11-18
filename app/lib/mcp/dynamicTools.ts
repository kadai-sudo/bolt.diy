import z from 'zod';
import { initMcpClient, invokeMcpTool } from './mcpClient';
import { MCPToolsListResponseSchema } from './mcpSchemas';

export async function loadDynamicMcpTools() {
  console.log('Loading MCP tools dynamically...始まるよ');

  let rawEvent: any;

  // ---- MCP request ----
  try {
    const client = await initMcpClient();
    rawEvent = await client.request(
      {
        method: 'tools/list',
        params: {},
      },
      z.any(),
    );
  } catch (err: any) {
    console.log('❌ MCP request error:', err);
    return {};
  }

  // ---- JSON 抽出 ----
  let json: any;
  try {
    // SSE 経由だと rawEvent が { tools: [...] } になる
    if (typeof rawEvent === 'string') {
      json = JSON.parse(rawEvent);
    } else {
      json = rawEvent;
    }
  } catch (err: any) {
    console.log('❌ JSON parse error:', err);
    console.log('📝 rawEvent:', rawEvent);
    return {};
  }

  // ---- JSON-RPC 形式に補完 ----
  let normalized: any;

  try {
    if (json.jsonrpc) {
      normalized = json; // すでに JSON-RPC 形式
    } else {
      normalized = {
        jsonrpc: '2.0',
        id: 'dummy',
        result: json, // ← tools:[...] がここに入る
      };
    }
  } catch (err: any) {
    console.log('❌ JSON normalize error:', err);
    console.log('📝 json:', json);
    return {};
  }

  // ---- Zod schema parse ----
  let parsed: any = {};
  try {
    parsed = MCPToolsListResponseSchema.parse(normalized);
  } catch (err: any) {
    console.log('❌ Zod schema parse error:', err);
    console.log('📝 normalized:', normalized);
    return {};
  }

  const tools = parsed.result.tools;
  const boltTools: Record<string, any> = {};
  console.log('ツール一覧', tools.slice(0, 5)); // 先頭5件だけ表示
  // ---- Build Bolt tool objects ----
  for (const tool of tools) {
    boltTools[tool.name] = {
      description: tool.description ?? '',
      parameters: convertJsonSchemaToZod(tool.inputSchema),
      async execute(args: any) {
        try {
          return await invokeMcpTool(tool.name, args);
        } catch (err: any) {
          console.log(`❌ invokeMcpTool(${tool.name}) error:`, err);
          return null;
        }
      },
    };
  }

  return boltTools;
}

// ---- JSON Schema → Zod ----
function convertJsonSchemaToZod(schema: any): z.ZodTypeAny {
  try {
    if (!schema || !schema.properties) return z.object({});

    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, value] of Object.entries<any>(schema.properties)) {
      let zodType: z.ZodTypeAny = z.any();

      switch (value.type) {
        case 'string':
          zodType = z.string();
          break;
        case 'number':
          zodType = z.number();
          break;
        case 'integer':
          zodType = z.number().int();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        default:
          zodType = z.any();
      }

      if (!schema.required?.includes(key)) {
        zodType = zodType.optional();
      }

      shape[key] = zodType;
    }

    return z.object(shape);
  } catch (err: any) {
    console.log('❌ convertJsonSchemaToZod error:', err);
    return z.object({});
  }
}
