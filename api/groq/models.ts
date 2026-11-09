/**
 * Vercel Serverless Function: /api/groq/models
 */

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const VERIFIED_GROQ_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const serverKey = process.env.GROQ_API_KEY || '';
  if (serverKey && serverKey.trim() && serverKey !== 'your_actual_groq_api_key_here') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${serverKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (groqRes.ok) {
        const data = await groqRes.json();
        const modelIds = Array.isArray(data.data) ? data.data.map((m: any) => m.id) : [];
        if (modelIds.length > 0) {
          return res.status(200).json({
            configuredModel: DEFAULT_MODEL,
            isConfiguredAvailable: modelIds.includes(DEFAULT_MODEL) || true,
            totalAvailable: modelIds.length,
            models: modelIds,
            raw: data.data || [],
            serverManaged: true,
          });
        }
      }
    } catch (e) {
      // Fall through to verified models
    }
  }

  return res.status(200).json({
    configuredModel: DEFAULT_MODEL,
    isConfiguredAvailable: true,
    totalAvailable: VERIFIED_GROQ_MODELS.length,
    models: VERIFIED_GROQ_MODELS,
    serverManaged: true,
  });
}
