/**
 * Vercel Serverless Function: /api/status
 */
import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const envKey = process.env.GROQ_API_KEY;
  const isKeyPresent = Boolean(envKey && envKey.trim() && envKey !== 'your_actual_groq_api_key_here');

  return res.status(200).json({
    status: 'online',
    appName: 'StockWise AI',
    groqConfigured: isKeyPresent,
    defaultModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    serverTime: new Date().toISOString(),
  });
}
