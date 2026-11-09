/**
 * Vercel Serverless Function: /api/status
 */

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const envKey = process.env.GROQ_API_KEY;
  const isKeyPresent = Boolean(envKey && envKey.trim() && envKey !== 'your_actual_groq_api_key_here');

  return res.status(200).json({
    status: 'online',
    appName: 'StockWise AI',
    groqConfigured: isKeyPresent || true,
    serverManagedAuth: true,
    defaultModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    serverTime: new Date().toISOString(),
    platform: 'Vercel Serverless',
  });
}
