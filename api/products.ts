/**
 * Vercel Serverless Function: /api/products
 */

let memoryProducts: any[] = [];

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
      return res.status(200).json({ products: memoryProducts });
    }

    if (req.method === 'POST') {
      const prod = req.body;
      if (prod && prod.id) {
        const idx = memoryProducts.findIndex((p) => p.id === prod.id);
        if (idx >= 0) {
          memoryProducts[idx] = { ...memoryProducts[idx], ...prod };
        } else {
          memoryProducts.unshift(prod);
        }
      }
      return res.status(200).json({ success: true, product: prod });
    }

    if (req.method === 'PUT') {
      const targetId = id || req.body?.id;
      const updates = req.body || {};
      const prod = memoryProducts.find((p) => p.id === targetId);
      if (prod) {
        Object.assign(prod, updates);
      }
      return res.status(200).json({ success: true, id: targetId, updates });
    }

    if (req.method === 'DELETE') {
      const targetId = id || req.body?.id;
      memoryProducts = memoryProducts.filter((p) => p.id !== targetId);
      return res.status(200).json({ success: true, id: targetId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
