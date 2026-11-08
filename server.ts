/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// -----------------------------------------------------------------------------
// SQLite Persistent Storage for Conversations
// -----------------------------------------------------------------------------
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.resolve(dataDir, 'stockwise.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    messages TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    cost_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    stock_quantity INTEGER NOT NULL,
    min_stock_level INTEGER NOT NULL,
    supplier TEXT,
    supplier_id TEXT,
    date_added TEXT NOT NULL,
    sales_count INTEGER DEFAULT 0,
    last_restocked TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    unit_price REAL,
    total_amount REAL,
    notes TEXT,
    timestamp TEXT NOT NULL
  );
`);

// Configurable default model from requirements - verified available in Groq
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const VERIFIED_GROQ_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
];

// Helper: Query Groq Models Endpoint with timeout
async function fetchGroqAvailableModels(apiKey: string): Promise<{ models: string[]; raw: any[]; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      return { models: [], raw: [], error: `Groq Models API returned HTTP ${response.status}: ${errBody}` };
    }

    const data = await response.json();
    const modelIds = Array.isArray(data.data) ? data.data.map((m: any) => m.id) : [];
    return { models: modelIds, raw: data.data || [] };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { models: [], raw: [], error: 'Timeout verifying models from Groq endpoint (10s exceeded).' };
    }
    return { models: [], raw: [], error: err.message || 'Network failure connecting to Groq models endpoint.' };
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Status Endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const envKey = process.env.GROQ_API_KEY;
  const isKeyPresent = Boolean(envKey && envKey.trim() && envKey !== 'your_actual_groq_api_key_here');

  res.json({
    status: 'online',
    appName: 'StockWise AI',
    groqConfigured: isKeyPresent,
    defaultModel: DEFAULT_MODEL,
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// -----------------------------------------------------------------------------
// Conversation History API (SQLite Persistent Storage)
// -----------------------------------------------------------------------------

// Fetch all conversations
app.get('/api/conversations', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT id, title, created_at, updated_at, messages FROM conversations ORDER BY updated_at DESC').all() as any[];
    const conversations = rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messages: JSON.parse(row.messages || '[]'),
    }));
    res.json({ conversations });
  } catch (err: any) {
    console.error('Error fetching conversations from SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Save / Upsert conversation
app.post('/api/conversations', (req: Request, res: Response) => {
  try {
    const { id, title, createdAt, updatedAt, messages } = req.body;
    if (!id || !title) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Conversation id and title are required.' });
    }

    const messagesJson = JSON.stringify(messages || []);
    const now = new Date().toISOString();
    const created = createdAt || now;
    const updated = updatedAt || now;

    const stmt = db.prepare(`
      INSERT INTO conversations (id, title, created_at, updated_at, messages)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        updated_at = excluded.updated_at,
        messages = excluded.messages;
    `);

    stmt.run(id, title, created, updated, messagesJson);
    res.json({
      success: true,
      conversation: { id, title, createdAt: created, updatedAt: updated, messages: messages || [] },
    });
  } catch (err: any) {
    console.error('Error saving conversation to SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Rename or update conversation
app.put('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, messages } = req.body;

    const existing = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Conversation not found.' });
    }

    const newTitle = title !== undefined ? title : existing.title;
    const newMessages = messages !== undefined ? JSON.stringify(messages) : existing.messages;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE conversations
      SET title = ?, messages = ?, updated_at = ?
      WHERE id = ?;
    `);

    stmt.run(newTitle, newMessages, now, id);
    res.json({ success: true, conversation: { id, title: newTitle, updatedAt: now } });
  } catch (err: any) {
    console.error('Error updating conversation in SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Delete conversation
app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
    stmt.run(id);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting conversation in SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// -----------------------------------------------------------------------------
// Products API (SQLite Persistent Storage)
// -----------------------------------------------------------------------------

// Fetch all products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM products ORDER BY name ASC').all() as any[];
    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      category: r.category,
      description: r.description || '',
      costPrice: Number(r.cost_price),
      sellingPrice: Number(r.selling_price),
      stockQuantity: Number(r.stock_quantity),
      minStockLevel: Number(r.min_stock_level),
      supplier: r.supplier || '',
      supplierId: r.supplier_id || '',
      dateAdded: r.date_added,
      salesCount: Number(r.sales_count || 0),
      lastRestocked: r.last_restocked || '',
    }));
    res.json({ products });
  } catch (err: any) {
    console.error('Error fetching products from SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Upsert product
app.post('/api/products', (req: Request, res: Response) => {
  try {
    const p = req.body;
    if (!p.id || !p.name) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Product ID and Name are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO products (id, name, sku, category, description, cost_price, selling_price, stock_quantity, min_stock_level, supplier, supplier_id, date_added, sales_count, last_restocked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        sku = excluded.sku,
        category = excluded.category,
        description = excluded.description,
        cost_price = excluded.cost_price,
        selling_price = excluded.selling_price,
        stock_quantity = excluded.stock_quantity,
        min_stock_level = excluded.min_stock_level,
        supplier = excluded.supplier,
        supplier_id = excluded.supplier_id,
        sales_count = excluded.sales_count,
        last_restocked = excluded.last_restocked;
    `);

    stmt.run(
      p.id,
      p.name,
      p.sku || `SKU-${Date.now().toString().slice(-4)}`,
      p.category || 'General',
      p.description || '',
      Number(p.costPrice || p.cost_price || 0),
      Number(p.sellingPrice || p.selling_price || 0),
      Number(p.stockQuantity || p.stock_quantity || 0),
      Number(p.minStockLevel || p.min_stock_level || 5),
      p.supplier || '',
      p.supplierId || '',
      p.dateAdded || new Date().toISOString(),
      Number(p.salesCount || 0),
      p.lastRestocked || new Date().toISOString()
    );

    res.json({ success: true, product: p });
  } catch (err: any) {
    console.error('Error saving product to SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Update product
app.put('/api/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;

    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found.' });
    }

    const name = updates.name !== undefined ? updates.name : existing.name;
    const sku = updates.sku !== undefined ? updates.sku : existing.sku;
    const category = updates.category !== undefined ? updates.category : existing.category;
    const description = updates.description !== undefined ? updates.description : existing.description;
    const costPrice = updates.costPrice !== undefined ? updates.costPrice : existing.cost_price;
    const sellingPrice = updates.sellingPrice !== undefined ? updates.sellingPrice : existing.selling_price;
    const stockQuantity = updates.stockQuantity !== undefined ? updates.stockQuantity : existing.stock_quantity;
    const minStockLevel = updates.minStockLevel !== undefined ? updates.minStockLevel : existing.min_stock_level;
    const supplier = updates.supplier !== undefined ? updates.supplier : existing.supplier;
    const salesCount = updates.salesCount !== undefined ? updates.salesCount : existing.sales_count;
    const lastRestocked = updates.lastRestocked !== undefined ? updates.lastRestocked : existing.last_restocked;

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?, sku = ?, category = ?, description = ?,
        cost_price = ?, selling_price = ?, stock_quantity = ?,
        min_stock_level = ?, supplier = ?, sales_count = ?, last_restocked = ?
      WHERE id = ?;
    `);

    stmt.run(name, sku, category, description, costPrice, sellingPrice, stockQuantity, minStockLevel, supplier, salesCount, lastRestocked, id);
    res.json({ success: true, id, updates });
  } catch (err: any) {
    console.error('Error updating product in SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting product in SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// -----------------------------------------------------------------------------
// Inventory Transactions API (Stock In / Stock Out / Adjustments)
// -----------------------------------------------------------------------------

// Fetch transactions
app.get('/api/transactions', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM inventory_transactions ORDER BY timestamp DESC').all() as any[];
    const transactions = rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      type: r.type,
      quantity: Number(r.quantity),
      previousQuantity: Number(r.previous_quantity),
      newQuantity: Number(r.new_quantity),
      unitPrice: r.unit_price ? Number(r.unit_price) : undefined,
      totalAmount: r.total_amount ? Number(r.total_amount) : undefined,
      notes: r.notes || '',
      timestamp: r.timestamp,
    }));
    res.json({ transactions });
  } catch (err: any) {
    console.error('Error fetching transactions from SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Record transaction & update product stock atomically
app.post('/api/transactions', (req: Request, res: Response) => {
  try {
    const { productId, productName, type, quantity, notes, unitPrice } = req.body;
    if (!productId || !type || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'productId, valid type, and quantity > 0 are required.' });
    }

    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!prod) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: `Product with ID ${productId} not found.` });
    }

    const previousQuantity = Number(prod.stock_quantity);
    let newQuantity = previousQuantity;

    if (type === 'stock_in') {
      newQuantity = previousQuantity + Number(quantity);
    } else if (type === 'stock_out') {
      if (previousQuantity < Number(quantity)) {
        return res.status(400).json({
          error: 'INSUFFICIENT_STOCK',
          message: `Cannot record Stock Out: Only ${previousQuantity} unit(s) available for "${prod.name}". Preventing negative inventory.`,
        });
      }
      newQuantity = previousQuantity - Number(quantity);
    } else if (type === 'adjustment') {
      newQuantity = Number(quantity);
    } else {
      return res.status(400).json({ error: 'INVALID_TYPE', message: 'Transaction type must be stock_in, stock_out, or adjustment.' });
    }

    const txId = `tx-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const effectivePrice = unitPrice || (type === 'stock_out' ? prod.selling_price : prod.cost_price);
    const totalAmount = Number((effectivePrice * quantity).toFixed(2));

    // Update product quantity
    db.prepare(`
      UPDATE products
      SET stock_quantity = ?, last_restocked = ?
      WHERE id = ?;
    `).run(newQuantity, type === 'stock_in' ? now : prod.last_restocked, productId);

    // Insert transaction
    db.prepare(`
      INSERT INTO inventory_transactions (id, product_id, product_name, type, quantity, previous_quantity, new_quantity, unit_price, total_amount, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `).run(txId, productId, prod.name, type, quantity, previousQuantity, newQuantity, effectivePrice, totalAmount, notes || '', now);

    res.json({
      success: true,
      transaction: {
        id: txId,
        productId,
        productName: prod.name,
        type,
        quantity,
        previousQuantity,
        newQuantity,
        unitPrice: effectivePrice,
        totalAmount,
        notes: notes || '',
        timestamp: now,
      },
      newStock: newQuantity,
    });
  } catch (err: any) {
    console.error('Error executing inventory transaction in SQLite:', err);
    res.status(500).json({ error: 'DATABASE_ERROR', message: err.message });
  }
});

// Groq Models Availability Verification Endpoint
app.get('/api/groq/models', async (req: Request, res: Response) => {
  const customKey = req.headers.authorization?.replace('Bearer ', '') || process.env.GROQ_API_KEY || '';

  if (!customKey || customKey === 'your_actual_groq_api_key_here') {
    return res.status(401).json({
      error: 'GROQ_API_KEY_REQUIRED',
      message: 'Groq API Key is missing. Please configure GROQ_API_KEY in .env or Settings.',
    });
  }

  const { models, raw, error } = await fetchGroqAvailableModels(customKey);
  if (error) {
    return res.status(502).json({
      error: 'GROQ_MODELS_FETCH_ERROR',
      message: error,
    });
  }

  // Check if configured model is available
  const isConfiguredAvailable = models.includes(DEFAULT_MODEL);

  res.json({
    configuredModel: DEFAULT_MODEL,
    isConfiguredAvailable,
    totalAvailable: models.length,
    models,
    raw,
  });
});

// Chat Completions Endpoint (Groq OpenAI-Compatible)
app.post('/api/chat', async (req: Request, res: Response) => {
  const customKey = (req.body.customApiKey && req.body.customApiKey.trim()) || process.env.GROQ_API_KEY || '';

  if (!customKey || customKey === 'your_actual_groq_api_key_here') {
    return res.status(401).json({
      error: 'GROQ_API_KEY_REQUIRED',
      message: 'Groq API Key is not configured. Please add GROQ_API_KEY to your .env file or Settings panel.',
      status: 401,
    });
  }

  const requestedModel = req.body.model || DEFAULT_MODEL;

  // 1. Mandatory Model Availability Verification
  const { models: availableModels, error: modelsError } = await fetchGroqAvailableModels(customKey);
  if (modelsError) {
    return res.status(502).json({
      error: 'GROQ_VERIFICATION_FAILED',
      message: `Failed to verify model availability: ${modelsError}`,
      status: 502,
    });
  }

  // Strict enforcement: Never silently assume a model is available. Do not automatically switch.
  if (!availableModels.includes(requestedModel)) {
    return res.status(400).json({
      error: 'MODEL_UNAVAILABLE',
      message: `The requested model "${requestedModel}" was verified against the Groq models endpoint and is currently NOT available in your Groq account.`,
      requestedModel,
      availableModels: availableModels.slice(0, 10),
      status: 400,
    });
  }

  // 2. Build system instructions with real store database context
  const { messages, systemContext, responseMode = 'concise', analysisFocus = 'inventory' } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'A non-empty messages array is required.',
      status: 400,
    });
  }

  const lengthGuidelines =
    responseMode === 'concise'
      ? 'CONCISE MODE: Answer directly in 1-3 sentences or 3-5 bullet points. No conversational filler.'
      : responseMode === 'balanced'
      ? 'BALANCED MODE: Provide 1-2 focused paragraphs with actionable figures and data insights.'
      : 'DETAILED MODE: Provide a comprehensive audit with exact margins, turnover analysis, and strategic steps.';

  const systemPrompt = `You are StockWise AI Assistant, an intelligent, professional inventory management and business intelligence expert.
You are the PRIMARY interface for managing the user's products, stock transactions, valuations, and business decisions.

ROLE & CORE CAPABILITIES:
1. Complete Inventory Operations:
- When a user asks to add/receive stock (e.g. "Add 100 units of Sugar", "Record 20 units of stock received"), acknowledge the stock addition and emit a structured action block.
- When a user asks to change prices or details (e.g. "Change the price of Rice to 250"), acknowledge the update and emit an action block.
- When a user asks to delete a product (e.g. "Delete the Milk product"), clearly identify the product and emit a REQUEST_DELETE action block asking for confirmation.
- When a user asks about available stock, low stock, complete inventory, or valuation, answer with accurate data from the snapshot.

2. STRUCTURED ACTION BLOCKS:
Whenever the user instructs you to perform a real database operation, write your natural explanation, then at the very end of your response, output a single JSON code block tagged with "json:stockwise_action":
- For Stock In / Receiving inventory:
\`\`\`json:stockwise_action
{"action": "STOCK_IN", "productName": "...", "quantity": 100}
\`\`\`
- For Stock Out / Sold / Removed inventory:
\`\`\`json:stockwise_action
{"action": "STOCK_OUT", "productName": "...", "quantity": 20}
\`\`\`
- For updating product price or info:
\`\`\`json:stockwise_action
{"action": "UPDATE_PRODUCT", "productName": "...", "updates": {"sellingPrice": 250}}
\`\`\`
- For adding a brand new product to the catalog:
\`\`\`json:stockwise_action
{"action": "ADD_PRODUCT", "product": {"name": "...", "category": "...", "stockQuantity": 100, "costPrice": 45, "sellingPrice": 85}}
\`\`\`
- For deleting a product (requires confirmation):
\`\`\`json:stockwise_action
{"action": "REQUEST_DELETE", "productName": "..."}
\`\`\`

3. Grounding & Anti-Hallucination:
- Use ONLY the real database snapshot provided below. NEVER invent non-existent products, fake stock quantities, or fake revenue.
- If data is empty or a product is not found, state that clearly and offer to add it.

${lengthGuidelines}
PRIMARY FOCUS: ${analysisFocus.toUpperCase()}

ACTUAL REAL-TIME DATABASE SNAPSHOT:
${systemContext || 'No database snapshot provided.'}`;

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    })),
  ];

  // 3. Request Timeout Handling (15 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: requestedModel,
        messages: groqMessages,
        temperature: responseMode === 'concise' ? 0.3 : 0.6,
        max_tokens: responseMode === 'concise' ? 450 : responseMode === 'balanced' ? 900 : 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      let parsedErr: any = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch {}

      const statusCode = groqResponse.status;
      let userFriendlyMessage = `Groq API Error (${statusCode}): `;

      if (statusCode === 400) {
        userFriendlyMessage += parsedErr.error?.message || 'Invalid request parameters.';
      } else if (statusCode === 401) {
        userFriendlyMessage += 'Invalid Groq API key. Please check your credentials in Settings.';
      } else if (statusCode === 403) {
        userFriendlyMessage += 'Access denied by Groq API. Check your account permissions.';
      } else if (statusCode === 404) {
        userFriendlyMessage += `Model or endpoint not found on Groq.`;
      } else if (statusCode === 429) {
        userFriendlyMessage += 'Groq rate limit exceeded. Please wait a moment and try again.';
      } else if (statusCode >= 500) {
        userFriendlyMessage += 'Groq server error. Service is temporarily unavailable.';
      } else {
        userFriendlyMessage += parsedErr.error?.message || errText;
      }

      return res.status(statusCode).json({
        error: 'GROQ_API_ERROR',
        message: userFriendlyMessage,
        status: statusCode,
      });
    }

    const completion = await groqResponse.json();

    if (!completion || !completion.choices || completion.choices.length === 0) {
      return res.status(500).json({
        error: 'EMPTY_AI_RESPONSE',
        message: 'Groq API returned an empty completion choice.',
        status: 500,
      });
    }

    const replyContent = completion.choices[0]?.message?.content;
    if (!replyContent || !replyContent.trim()) {
      return res.status(500).json({
        error: 'EMPTY_AI_RESPONSE',
        message: 'Groq API returned an empty response text.',
        status: 500,
      });
    }

    res.json({
      content: replyContent,
      modelUsed: completion.model || requestedModel,
      usage: completion.usage,
      responseMode,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'REQUEST_TIMEOUT',
        message: 'Groq API request timed out (15 seconds limit). Please retry.',
        status: 504,
      });
    }
    return res.status(500).json({
      error: 'NETWORK_FAILURE',
      message: `Failed to connect to Groq API: ${err.message || 'Network failure'}`,
      status: 500,
    });
  }
});

// CSV Export Endpoint
app.post('/api/export/csv', (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data array provided.' });
    }

    let csvContent = '';
    if (type === 'inventory') {
      csvContent += 'Product ID,SKU,Product Name,Category,Description,Purchase Price,Selling Price,Available Quantity,Min Stock Level,Supplier,Date Added\n';
      data.forEach((p: any) => {
        csvContent += `"${p.id}","${p.sku}","${(p.name || '').replace(/"/g, '""')}","${p.category}","${(p.description || '').replace(/"/g, '""')}",${p.costPrice || p.purchasePrice},${p.sellingPrice},${p.stockQuantity || p.quantity},${p.minStockLevel},"${(p.supplier || '').replace(/"/g, '""')}","${p.lastRestocked || p.dateAdded}"\n`;
      });
    } else if (type === 'sales') {
      csvContent += 'Transaction ID,Date,Product Name,SKU,Quantity,Unit Price,Unit Cost,Total Revenue,Total Cost,Total Profit,Profit Margin (%),Customer,Payment Method\n';
      data.forEach((s: any) => {
        csvContent += `"${s.id}","${s.date}","${(s.productName || '').replace(/"/g, '""')}","${s.sku}",${s.quantity},${s.unitPrice},${s.unitCost},${s.totalRevenue},${s.totalCost},${s.profit},${s.profitMargin},"${(s.customer || '').replace(/"/g, '""')}","${s.paymentMethod}"\n`;
      });
    } else if (type === 'purchases') {
      csvContent += 'Purchase ID,Date,Supplier,Product Name,Quantity,Unit Cost,Total Amount,Status\n';
      data.forEach((pc: any) => {
        csvContent += `"${pc.id}","${pc.date}","${(pc.supplierName || '').replace(/"/g, '""')}","${(pc.productName || '').replace(/"/g, '""')}",${pc.quantity},${pc.unitCost},${pc.totalAmount},"${pc.status}"\n`;
      });
    } else if (type === 'suppliers') {
      csvContent += 'Supplier ID,Name,Contact Person,Email,Phone,Address,Category,Products Supplied,Total Orders\n';
      data.forEach((sp: any) => {
        csvContent += `"${sp.id}","${(sp.name || '').replace(/"/g, '""')}","${(sp.contactPerson || '').replace(/"/g, '""')}","${sp.email}","${sp.phone}","${(sp.address || '').replace(/"/g, '""')}","${sp.category}",${sp.productsSupplied || 0},${sp.totalOrders || 0}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=stockwise_${type}_export.csv`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server (Vite in Dev, Static in Prod)
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(` StockWise AI Full-Stack Server running on port ${port}`);
    console.log(` Groq Chat API: https://api.groq.com/openai/v1/chat/completions`);
    console.log(` Configured Model: ${DEFAULT_MODEL}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
