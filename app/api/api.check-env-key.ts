import type { LoaderFunction } from '@remix-run/node';
import { LLMManager } from '~/lib/modules/llm/manager';
import { getApiKeysFromCookie } from '~/lib/api/cookies';

// Node.js の場合 context.cloudflare.env が無いので安全に取り出す
function getEnv(context: any): Record<string, any> {
  return (
    context?.cloudflare?.env || // Cloudflare Workers
    process.env || // Node.js / Docker
    {} // fallback
  );
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  if (!provider) {
    return Response.json({ isSet: false });
  }

  const env = getEnv(context);

  // LLM Manager を Cloudflare / Node 両対応で初期化
  const llmManager = LLMManager.getInstance(env);
  const providerInstance = llmManager.getProvider(provider);

  if (!providerInstance || !providerInstance.config.apiTokenKey) {
    return Response.json({ isSet: false });
  }

  const envVarName = providerInstance.config.apiTokenKey;

  // cookies → context.env → process.env → manager.env の順に探す
  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = getApiKeysFromCookie(cookieHeader);

  const isSet = !!(
    apiKeys?.[provider] ||
    env?.[envVarName] || // context.cloudflare.env or process.env
    process.env[envVarName] || // safety: Node direct
    llmManager.env?.[envVarName]
  );

  return Response.json({ isSet });
};
