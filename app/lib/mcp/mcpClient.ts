// import { Client } from '@modelcontextprotocol/sdk/client';

// let mcpClient: Client | null = null;

// export async function initMcpClient() {
//   console.log(`[MCP] Connecting to ${process.env.MCP_SERVER_URL} via ${process.env.MCP_TRANSPORT}`);
//   if (!mcpClient) {
//     mcpClient = new Client({
//       name: 'bolt-client',
//       version: '1.0.0',
//     });
//   }
//   return mcpClient;
// }
// // server: {
// //   url: process.env.MCP_SERVER_URL!,
// //   apiKey: process.env.MCP_API_KEY!,
// //   transport: process.env.MCP_TRANSPORT || 'sse', // sse or http
// // },

// export async function invokeMcpTool(toolName: string, params: Record<string, any>) {
//   const client = await initMcpClient();
//   console.log(`[MCP] Invoking tool: ${toolName}`);
//   const tool = await client.getTool(toolName);
//   if (!tool) throw new Error(`Tool "${toolName}" not found on MCP server.`);

//   // 環境変数によって run / runStream を自動切替
//   if (process.env.MCP_TRANSPORT === 'sse') {
//     const stream = await tool.runStream(params);
//     const results: any[] = [];
//     for await (const chunk of stream) {
//       if (chunk.data) results.push(chunk.data);
//     }
//     return results;
//   } else {
//     return await tool.run(params);
//   }
// }

// export async function invokeMcpTool(toolName: string, args: Record<string, any>) {
//   console.log(`[MCP] Invoking AWS MCP tool: ${toolName}`);

//   const res = await fetch(process.env.MCP_SERVER_URL!, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       method: 'tools/call',
//       params: {
//         name: toolName,
//         arguments: args,
//       },
//     }),
//   });

//   if (!res.ok) {
//     throw new Error(`[MCP] Server error: ${res.status}`);
//   }

//   const json = await res.json();
//   return json;
// }

// import { Client } from '@modelcontextprotocol/sdk/client';
// import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
// import z from 'zod';

// let mcpClient: Client | null = null;

// export async function initMcpClient() {
//   if (!mcpClient) {
//     mcpClient = new Client({
//       name: 'bolt-client',
//       version: '1.0.0',
//     });

//     const transport = new HttpTransport({
//       url: process.env.MCP_SERVER_URL!, // 例: http://13.208.173.79:8000
//     });

//     await mcpClient.connect(transport);
//   }
//   return mcpClient;
// }

// export async function invokeMcpTool(toolName: string, params: any) {
//   const client = await initMcpClient();
//   return await client.request(
//     {
//       method: toolName,
//       params: {
//         ...params,
//         _meta: {},
//       },
//     },
//     z.any(),
//   );
// }
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import z from 'zod';

let mcpClient: Client | null = null;

export async function initMcpClient() {
  console.log('initMcpClient called');
  if (!mcpClient) {
    console.log('新しく作るよ');
    mcpClient = new Client(
      {
        name: 'bolt-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    const transport = new StreamableHTTPClientTransport(
      new URL(process.env.MCP_SERVER_URL!), // 例: http://13.208.173.79:8000/mcp
    );
    console.log('Transport initialized:', transport);

    await mcpClient.connect(transport);
  }
  return mcpClient;
}

export async function invokeMcpTool(toolName: string, params: any) {
  const client = await initMcpClient();

  return await client.request(
    {
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    },
    z.any(), // Bolt 側では返却値は任意で OK
  );
}
