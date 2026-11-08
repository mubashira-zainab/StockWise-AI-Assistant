/**
 * Vercel Serverless Function: /api/chat
 */
import type { Request, Response } from 'express';
import Groq from 'groq-sdk';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      messages,
      systemContext,
      responseMode = 'concise',
      analysisFocus = 'all',
      model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      customApiKey,
    } = req.body;

    const apiKey = (customApiKey && customApiKey.trim()) || process.env.GROQ_API_KEY || '';
    if (!apiKey || apiKey === 'your_actual_groq_api_key_here') {
      return res.status(401).json({
        error: 'GROQ_API_KEY_REQUIRED',
        message: 'Groq API Key is not configured. Please add GROQ_API_KEY to your Vercel Environment Variables or Settings.',
      });
    }

    const client = new Groq({ apiKey });

    const lengthGuidelines =
      responseMode === 'concise'
        ? `STRICT RESPONSE LENGTH: CONCISE MODE. 1-3 sentences for answers, 3-6 bullet points for lists. Direct, answer first.`
        : responseMode === 'balanced'
        ? `RESPONSE LENGTH: BALANCED MODE. 1-2 focused paragraphs with actionable figures and next steps.`
        : `RESPONSE LENGTH: DETAILED MODE. Thorough analysis with margins, calculations, and operational recommendations.`;

    const systemPrompt = `You are StockWise AI, an intelligent business advisor and inventory management expert.
Values: Professional, empathetic, patient, clear, and confident.
Grounding: NEVER hallucinate numbers. Use only the actual business data provided in the snapshot.

${lengthGuidelines}
Analysis Focus: ${analysisFocus.toUpperCase()}

LIVE STORE DATA SNAPSHOT:
${systemContext || 'No store snapshot provided.'}`;

    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: model,
      messages: groqMessages,
      temperature: responseMode === 'concise' ? 0.3 : 0.6,
      max_tokens: responseMode === 'concise' ? 400 : responseMode === 'balanced' ? 800 : 1800,
    });

    const reply = completion.choices[0]?.message?.content || 'No response from Groq AI.';

    return res.status(200).json({
      content: reply,
      modelUsed: completion.model || model,
      responseMode,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Vercel API error:', err);
    return res.status(err.status || 500).json({
      error: 'GROQ_API_ERROR',
      message: err.message || 'Internal server error',
    });
  }
}
