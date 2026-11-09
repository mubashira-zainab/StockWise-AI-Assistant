/**
 * Vercel Serverless Function: /api/transactions
 */

let memoryTransactions: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ transactions: memoryTransactions });
    }

    if (req.method === 'POST') {
      const txData = req.body;
      const tx = {
        id: `tx-${Date.now().toString().slice(-6)}`,
        ...txData,
        timestamp: new Date().toISOString(),
      };
      memoryTransactions.unshift(tx);
      return res.status(200).json({
        success: true,
        transaction: tx,
        newStock: txData.newQuantity || txData.quantity,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
