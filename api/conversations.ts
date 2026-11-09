/**
 * Vercel Serverless Function: /api/conversations
 */

// In-memory cache for serverless invocation lifetime
let memoryConversations: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query || {};

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ conversations: memoryConversations });
    }

    if (req.method === 'POST') {
      const conv = req.body;
      if (conv && conv.id) {
        const existingIdx = memoryConversations.findIndex((c) => c.id === conv.id);
        if (existingIdx >= 0) {
          memoryConversations[existingIdx] = { ...memoryConversations[existingIdx], ...conv };
        } else {
          memoryConversations.unshift(conv);
        }
      }
      return res.status(200).json({ success: true, conversation: conv });
    }

    if (req.method === 'PUT') {
      const targetId = id || req.body?.id;
      const { title, messages } = req.body || {};
      const conv = memoryConversations.find((c) => c.id === targetId);
      if (conv) {
        if (title !== undefined) conv.title = title;
        if (messages !== undefined) conv.messages = messages;
        conv.updatedAt = new Date().toISOString();
      }
      return res.status(200).json({ success: true, conversation: conv || { id: targetId, title } });
    }

    if (req.method === 'DELETE') {
      const targetId = id || req.body?.id;
      memoryConversations = memoryConversations.filter((c) => c.id !== targetId);
      return res.status(200).json({ success: true, id: targetId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
