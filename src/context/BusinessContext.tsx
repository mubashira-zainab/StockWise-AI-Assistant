/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Supplier,
  Sale,
  Purchase,
  AppNotification,
  Conversation,
  ChatMessage,
  BusinessMetrics,
  AISettings,
  ActiveTab,
  ResponseMode,
  AnalysisFocus,
  AccentColor,
  UserProfile,
  InventoryTransaction,
  TransactionType,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATION,
} from '../data/initialData';

interface BusinessContextType {
  // Data
  products: Product[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  notifications: AppNotification[];
  conversations: Conversation[];
  activeConversation: Conversation | undefined;
  activeConversationId: string;
  activeTab: ActiveTab;
  aiSettings: AISettings;
  metrics: BusinessMetrics;
  user: UserProfile;
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  isLeftPanelOpen: boolean;
  isAiStreaming: boolean;
  groqStatus: {
    online: boolean;
    configured: boolean;
    model: string;
    checking: boolean;
    isModelAvailable: boolean;
    availableModels: string[];
    error?: string;
  };

  // Nav & Preferences
  setActiveTab: (tab: ActiveTab) => void;
  setActiveConversationId: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setAccentColor: (color: AccentColor) => void;
  setResponseMode: (mode: ResponseMode) => void;
  setAnalysisFocus: (focus: AnalysisFocus) => void;
  setModel: (model: string) => void;
  setCustomApiKey: (key: string) => void;
  toggleLeftPanel: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Product Operations
  addProduct: (product: Omit<Product, 'id' | 'salesCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Supplier Operations
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalOrders' | 'totalSpend' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  transactions: InventoryTransaction[];

  // Transactions & Stock Movements
  recordStockMovement: (data: {
    productId: string;
    type: TransactionType;
    quantity: number;
    notes?: string;
    unitPrice?: number;
  }) => Promise<{ success: boolean; error?: string; transaction?: InventoryTransaction }>;
  confirmDeleteProduct: (productId: string, messageId?: string) => Promise<void>;
  cancelPendingAction: (messageId: string) => void;

  recordSale: (saleData: {
    productId: string;
    quantity: number;
    customer?: string;
    paymentMethod: 'Card' | 'Cash' | 'Transfer' | 'Online';
  }) => { success: boolean; error?: string };

  recordPurchase: (purchaseData: {
    supplierId: string;
    productId: string;
    quantity: number;
    unitCost: number;
    notes?: string;
  }) => { success: boolean; error?: string };

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // AI Chat
  sendMessage: (content: string) => Promise<void>;
  createNewConversation: (initialPrompt?: string) => string;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  clearCurrentConversation: () => void;
  regenerateLastMessage: () => Promise<void>;
  checkGroqStatus: () => Promise<void>;

  // Export
  exportCSV: (type: 'inventory' | 'sales' | 'purchases' | 'suppliers') => void;
  exportConversationJSON: () => void;
  resetToDemoData: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_suppliers');
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_sales');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_conversations');
      return saved ? JSON.parse(saved) : [INITIAL_CONVERSATION];
    } catch {
      return [INITIAL_CONVERSATION];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('stockwise_v2_active_conv');
      if (savedActive) return savedActive;
    } catch {}
    return conversations[0]?.id || INITIAL_CONVERSATION.id;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('stockwise_v2_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('assistant');

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('stockwise_theme');
      return saved === 'dark' ? 'dark' : 'light'; // Default: Light theme
    } catch {
      return 'light';
    }
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    try {
      const saved = localStorage.getItem('stockwise_accent');
      return (saved as AccentColor) || 'blue';
    } catch {
      return 'blue';
    }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('stockwise_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      uid: 'user-default-01',
      email: 'alex.mercer@stockwise.internal',
      displayName: 'Alex Mercer',
      role: 'Administrator',
      businessName: 'Vanguard Retail Systems',
    };
  });

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('stockwise_ai_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.model === 'llama-3.1-8b-instant' || parsed.model === 'llama-3.3-70b-versatile') {
          parsed.model = 'openai/gpt-oss-20b';
        }
        return parsed;
      }
    } catch {}
    return {
      responseMode: 'concise',
      analysisFocus: 'inventory',
      model: 'openai/gpt-oss-20b',
      customApiKey: '',
    };
  });

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  const [groqStatus, setGroqStatus] = useState<{
    online: boolean;
    configured: boolean;
    model: string;
    checking: boolean;
    isModelAvailable: boolean;
    availableModels: string[];
    error?: string;
  }>({
    online: true,
    configured: false,
    model: aiSettings.model,
    checking: false,
    isModelAvailable: false,
    availableModels: [],
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('stockwise_v2_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_v2_suppliers', JSON.stringify(suppliers));
    } catch {}
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_v2_sales', JSON.stringify(sales));
    } catch {}
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_v2_purchases', JSON.stringify(purchases));
    } catch {}
  }, [purchases]);

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_v2_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_v2_conversations', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      try {
        localStorage.setItem('stockwise_v2_active_conv', activeConversationId);
      } catch {}
    }
  }, [activeConversationId]);

  // Fetch persistent conversations, products, and transactions from backend SQLite database
  useEffect(() => {
    const fetchDatabaseFromBackend = async () => {
      try {
        // 1. Conversations
        const convRes = await fetch('/api/conversations');
        if (convRes.ok) {
          const data = await convRes.json();
          if (Array.isArray(data.conversations) && data.conversations.length > 0) {
            setConversations(data.conversations);
            setActiveConversationId((prev) => {
              const exists = data.conversations.some((c: any) => c.id === prev);
              return exists ? prev : data.conversations[0].id;
            });
            localStorage.setItem('stockwise_v2_conversations', JSON.stringify(data.conversations));
          } else {
            const seedConv = conversations[0] || INITIAL_CONVERSATION;
            await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(seedConv),
            });
          }
        }

        // 2. Products
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData.products) && prodData.products.length > 0) {
            setProducts(prodData.products);
            localStorage.setItem('stockwise_v2_products', JSON.stringify(prodData.products));
          } else {
            // Seed SQLite database with initial products
            for (const p of INITIAL_PRODUCTS) {
              await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
              });
            }
          }
        }

        // 3. Transactions
        const txRes = await fetch('/api/transactions');
        if (txRes.ok) {
          const txData = await txRes.json();
          if (Array.isArray(txData.transactions) && txData.transactions.length > 0) {
            setTransactions(txData.transactions);
            localStorage.setItem('stockwise_v2_transactions', JSON.stringify(txData.transactions));
          }
        }
      } catch (err) {
        console.warn('Could not sync initial database from backend:', err);
      }
    };
    fetchDatabaseFromBackend();
  }, []);

  const persistConversationToDB = async (conv: Conversation) => {
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conv),
      });
    } catch (e) {
      console.warn('Failed to persist conversation to SQLite:', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_ai_settings', JSON.stringify(aiSettings));
    } catch {}
  }, [aiSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('stockwise_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  // Apply theme classes to HTML & Body
  useEffect(() => {
    try {
      localStorage.setItem('stockwise_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light-mode-active');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.add('light-mode-active');
      }
    } catch {}
  }, [theme]);

  // Apply Accent Color Attribute to HTML
  useEffect(() => {
    try {
      localStorage.setItem('stockwise_accent', accentColor);
      document.documentElement.setAttribute('data-accent', accentColor);
    } catch {}
  }, [accentColor]);

  // Verify Groq Status & Available Models
  const checkGroqStatus = async () => {
    setGroqStatus((prev) => ({ ...prev, checking: true, error: undefined }));
    try {
      const headers: Record<string, string> = {};
      if (aiSettings.customApiKey) {
        headers['Authorization'] = `Bearer ${aiSettings.customApiKey}`;
      }

      const res = await fetch('/api/groq/models', { headers });
      if (res.ok) {
        const data = await res.json();
        const isAvail = data.models.includes(aiSettings.model);
        setGroqStatus({
          online: true,
          configured: true,
          model: aiSettings.model,
          checking: false,
          isModelAvailable: isAvail,
          availableModels: data.models || [],
        });
      } else {
        const errData = await res.json();
        setGroqStatus((prev) => ({
          ...prev,
          online: true,
          configured: errData.error !== 'GROQ_API_KEY_REQUIRED',
          checking: false,
          isModelAvailable: false,
          error: errData.message,
        }));
      }
    } catch (err: any) {
      setGroqStatus((prev) => ({
        ...prev,
        online: false,
        checking: false,
        isModelAvailable: false,
        error: 'Failed to connect to backend server on port 3000.',
      }));
    }
  };

  useEffect(() => {
    checkGroqStatus();
  }, [aiSettings.customApiKey, aiSettings.model]);

  // Real-Time Business Metrics Calculation
  const metrics: BusinessMetrics = useMemo(() => {
    const totalProducts = products.length;
    let totalInventoryQuantity = 0;
    let totalInventoryValue = 0;
    let totalCostValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const lowStockProducts: Product[] = [];
    const categoryMap: { [cat: string]: { count: number; value: number } } = {};

    products.forEach((p) => {
      totalInventoryQuantity += p.stockQuantity;
      totalInventoryValue += p.stockQuantity * p.sellingPrice;
      totalCostValue += p.stockQuantity * p.costPrice;

      if (p.stockQuantity === 0) {
        outOfStockCount++;
        lowStockProducts.push(p);
      } else if (p.stockQuantity <= p.minStockLevel) {
        lowStockCount++;
        lowStockProducts.push(p);
      }

      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, value: 0 };
      }
      categoryMap[p.category].count += 1;
      categoryMap[p.category].value += p.stockQuantity * p.sellingPrice;
    });

    // Sales Aggregations
    let totalRevenue = 0;
    let totalSalesCost = 0;
    let totalProfit = 0;
    const productSalesAgg: { [prodId: string]: { units: number; rev: number; profit: number } } = {};

    sales.forEach((s) => {
      totalRevenue += s.totalRevenue;
      totalSalesCost += s.totalCost;
      totalProfit += s.profit;

      if (!productSalesAgg[s.productId]) {
        productSalesAgg[s.productId] = { units: 0, rev: 0, profit: 0 };
      }
      productSalesAgg[s.productId].units += s.quantity;
      productSalesAgg[s.productId].rev += s.totalRevenue;
      productSalesAgg[s.productId].profit += s.profit;
    });

    const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Purchases Aggregations
    const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

    // Top Selling Products
    const topSellingProducts = Object.entries(productSalesAgg)
      .map(([prodId, agg]) => {
        const prod = products.find((p) => p.id === prodId) || {
          id: prodId,
          name: 'Archived Product',
          sku: 'N/A',
          category: 'Other',
          description: '',
          costPrice: 0,
          sellingPrice: 0,
          stockQuantity: 0,
          minStockLevel: 0,
          supplier: 'Unknown',
          dateAdded: '',
          lastRestocked: '',
          salesCount: agg.units,
        };
        return {
          product: prod,
          unitsSold: agg.units,
          revenue: agg.rev,
          profit: agg.profit,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category Distribution
    const categoryBreakdown = Object.entries(categoryMap).map(([category, info]) => ({
      category,
      productCount: info.count,
      inventoryValue: info.value,
    }));

    // Monthly Performance Data (Last 6 Months for Recharts)
    const monthlyPerformance = [
      { month: 'Jun', revenue: 4200, purchases: 3100, profit: 1100 },
      { month: 'Jul', revenue: 5800, purchases: 3400, profit: 2400 },
      { month: 'Aug', revenue: 5100, purchases: 3900, profit: 1200 },
      { month: 'Sep', revenue: 6400, purchases: 4100, profit: 2300 },
      { month: 'Oct', revenue: 7800, purchases: 4800, profit: 3000 },
      { month: 'Nov', revenue: totalRevenue, purchases: totalPurchasesAmount, profit: totalProfit },
    ];

    return {
      totalProducts,
      totalInventoryQuantity,
      totalInventoryValue,
      totalCostValue,
      totalRevenue,
      totalPurchasesAmount,
      totalProfit,
      averageProfitMargin,
      lowStockCount,
      outOfStockCount,
      totalSuppliers: suppliers.length,
      recentSalesCount: sales.length,
      recentPurchasesCount: purchases.length,
      topSellingProducts,
      lowStockProducts,
      categoryBreakdown,
      monthlyPerformance,
    };
  }, [products, suppliers, sales, purchases]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0];
  }, [conversations, activeConversationId]);

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'salesCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-6)}`,
      salesCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch((e) => console.warn('Failed to save product to SQLite:', e));

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'inventory_update',
      title: 'New Product Added',
      message: `"${newProduct.name}" (${newProduct.sku}) added to inventory.`,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'assistant',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          return updated;
        }
        return p;
      })
    );

    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((e) => console.warn('Failed to update product in SQLite:', e));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch((e) =>
      console.warn('Failed to delete product from SQLite:', e)
    );
  };

  // Stock Movement Transaction Handler
  const recordStockMovement = async (data: {
    productId: string;
    type: TransactionType;
    quantity: number;
    notes?: string;
    unitPrice?: number;
  }): Promise<{ success: boolean; error?: string; transaction?: InventoryTransaction }> => {
    const prod = products.find((p) => p.id === data.productId);
    if (!prod) return { success: false, error: 'Product not found in catalog.' };

    if (data.type === 'stock_out' && prod.stockQuantity < data.quantity) {
      return {
        success: false,
        error: `Insufficient stock: Only ${prod.stockQuantity} unit(s) of "${prod.name}" available. Preventing negative inventory.`,
      };
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          productName: prod.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.message || 'Transaction failed.' };
      }

      const resData = await res.json();
      const tx: InventoryTransaction = resData.transaction;
      const newStock = resData.newStock;

      setTransactions((prev) => [tx, ...prev]);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.productId
            ? {
                ...p,
                stockQuantity: newStock,
                lastRestocked: data.type === 'stock_in' ? new Date().toISOString() : p.lastRestocked,
              }
            : p
        )
      );

      // System notification
      const notifType = newStock === 0 ? 'out_of_stock' : newStock <= prod.minStockLevel ? 'low_stock' : 'inventory_update';
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: notifType,
          title: data.type === 'stock_in' ? 'Stock In Recorded' : 'Stock Movement',
          message: `${data.type === 'stock_in' ? '+' : '-'}${data.quantity} units for "${prod.name}" (Current stock: ${newStock}).`,
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: 'assistant',
        },
        ...prev,
      ]);

      return { success: true, transaction: tx };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error recording stock movement.' };
    }
  };

  const confirmDeleteProduct = async (productId: string, messageId?: string) => {
    const prod = products.find((p) => p.id === productId);
    const prodName = prod?.name || 'Product';

    deleteProduct(productId);

    if (activeConversation) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversation.id) return c;
          const updatedMsgs = c.messages.map((m) => {
            if (messageId && m.id === messageId) {
              return {
                ...m,
                content: `${m.content}\n\n✓ **Deletion Confirmed**: Permanent removal of **${prodName}** completed.`,
                pendingConfirmation: undefined,
                actionExecuted: {
                  type: 'delete_product' as const,
                  productName: prodName,
                  details: 'Permanently removed from database',
                },
              };
            }
            return m;
          });
          const updatedConv = { ...c, messages: updatedMsgs, updatedAt: new Date().toISOString() };
          persistConversationToDB(updatedConv);
          return updatedConv;
        })
      );
    }
  };

  const cancelPendingAction = (messageId: string) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        const updatedMsgs = c.messages.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              content: `${m.content}\n\n*Action cancelled by user.*`,
              pendingConfirmation: undefined,
            };
          }
          return m;
        });
        const updatedConv = { ...c, messages: updatedMsgs, updatedAt: new Date().toISOString() };
        persistConversationToDB(updatedConv);
        return updatedConv;
      })
    );
  };

  // Supplier CRUD
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalOrders' | 'totalSpend' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now().toString().slice(-4)}`,
      totalOrders: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // Record Sale Transaction
  const recordSale = (saleData: {
    productId: string;
    quantity: number;
    customer?: string;
    paymentMethod: 'Card' | 'Cash' | 'Transfer' | 'Online';
  }) => {
    const product = products.find((p) => p.id === saleData.productId);
    if (!product) return { success: false, error: 'Product not found.' };

    if (product.stockQuantity < saleData.quantity) {
      return {
        success: false,
        error: `Insufficient stock. Only ${product.stockQuantity} unit(s) available in inventory.`,
      };
    }

    const unitPrice = product.sellingPrice;
    const unitCost = product.costPrice;
    const totalRevenue = Number((unitPrice * saleData.quantity).toFixed(2));
    const totalCost = Number((unitCost * saleData.quantity).toFixed(2));
    const profit = Number((totalRevenue - totalCost).toFixed(2));
    const profitMargin = totalRevenue > 0 ? Number(((profit / totalRevenue) * 100).toFixed(2)) : 0;

    const newSale: Sale = {
      id: `sale-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: saleData.quantity,
      unitPrice,
      unitCost,
      totalRevenue,
      totalCost,
      profit,
      profitMargin,
      date: new Date().toISOString(),
      customer: saleData.customer || 'Walk-in Customer',
      paymentMethod: saleData.paymentMethod,
    };

    const newStock = product.stockQuantity - saleData.quantity;

    // Deduct stock in state
    updateProduct(product.id, {
      stockQuantity: newStock,
      salesCount: product.salesCount + saleData.quantity,
    });

    setSales((prev) => [newSale, ...prev]);

    // Check if stock became low or out
    if (newStock === 0) {
      const outNotif: AppNotification = {
        id: `notif-${Date.now() + 1}`,
        type: 'out_of_stock',
        title: 'Product Out of Stock!',
        message: `"${product.name}" has reached 0 available units.`,
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'inventory',
      };
      setNotifications((prev) => [outNotif, ...prev]);
    } else if (newStock <= product.minStockLevel) {
      const lowNotif: AppNotification = {
        id: `notif-${Date.now() + 1}`,
        type: 'low_stock',
        title: 'Low Stock Threshold Reached',
        message: `"${product.name}" is down to ${newStock} units (Threshold: ${product.minStockLevel}).`,
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'inventory',
      };
      setNotifications((prev) => [lowNotif, ...prev]);
    }

    // Success sale notification
    const saleNotif: AppNotification = {
      id: `notif-${Date.now() + 2}`,
      type: 'sale_success',
      title: 'Sale Successfully Recorded',
      message: `${saleData.quantity}x ${product.name} sold for $${totalRevenue.toFixed(2)} (+${profitMargin}% margin).`,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'sales',
    };
    setNotifications((prev) => [saleNotif, ...prev]);

    return { success: true };
  };

  // Record Purchase Transaction
  const recordPurchase = (purchaseData: {
    supplierId: string;
    productId: string;
    quantity: number;
    unitCost: number;
    notes?: string;
  }) => {
    const product = products.find((p) => p.id === purchaseData.productId);
    const supplier = suppliers.find((s) => s.id === purchaseData.supplierId);

    if (!product) return { success: false, error: 'Product not found.' };
    if (!supplier) return { success: false, error: 'Supplier not found.' };
    if (purchaseData.quantity <= 0) return { success: false, error: 'Quantity must be greater than zero.' };

    const totalAmount = Number((purchaseData.unitCost * purchaseData.quantity).toFixed(2));

    const newPurchase: Purchase = {
      id: `pur-${Date.now().toString().slice(-6)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: purchaseData.quantity,
      unitCost: purchaseData.unitCost,
      totalAmount,
      date: new Date().toISOString(),
      status: 'Received',
      notes: purchaseData.notes,
    };

    // Increase stock in inventory
    updateProduct(product.id, {
      stockQuantity: product.stockQuantity + purchaseData.quantity,
      costPrice: purchaseData.unitCost, // Update latest purchase cost
      lastRestocked: new Date().toISOString().slice(0, 10),
    });

    // Update supplier totals
    updateSupplier(supplier.id, {
      totalOrders: supplier.totalOrders + 1,
      totalSpend: Number((supplier.totalSpend + totalAmount).toFixed(2)),
    });

    setPurchases((prev) => [newPurchase, ...prev]);

    // Success notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'purchase_success',
      title: 'Stock Purchase Received',
      message: `Added +${purchaseData.quantity} units to "${product.name}" from ${supplier.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'purchases',
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  // Notification management
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Live Database Snapshot Formatter for AI Context
  const generateLiveBusinessSnapshot = () => {
    const lowStockList = metrics.lowStockProducts
      .map(
        (p) =>
          `- ${p.name} (SKU: ${p.sku}) | In-Stock: ${p.stockQuantity} | Threshold: ${p.minStockLevel} | Purchase Cost: $${p.costPrice.toFixed(
            2
          )} | Selling Price: $${p.sellingPrice.toFixed(2)} | Supplier: ${p.supplier}`
      )
      .join('\n');

    const topSellersList = metrics.topSellingProducts
      .map(
        (t) =>
          `- ${t.product.name} | Sold: ${t.unitsSold} units | Revenue: $${t.revenue.toFixed(
            2
          )} | Profit: $${t.profit.toFixed(2)}`
      )
      .join('\n');

    const recentSalesList = sales
      .slice(0, 5)
      .map(
        (s) =>
          `- ${s.productName} | Qty: ${s.quantity} | Total: $${s.totalRevenue.toFixed(2)} | Profit: $${s.profit.toFixed(
            2
          )} (${s.profitMargin}% margin) | ${new Date(s.date).toLocaleDateString()}`
      )
      .join('\n');

    const suppliersList = suppliers
      .slice(0, 6)
      .map((s) => `- ${s.name} (${s.category}) | Orders: ${s.totalOrders} | Spend: $${s.totalSpend.toFixed(2)}`)
      .join('\n');

    return `LIVE DATABASE SUMMARY:
Total Products: ${metrics.totalProducts} items
Total Physical Stock: ${metrics.totalInventoryQuantity} units
Inventory Valuation (Selling Price): $${metrics.totalInventoryValue.toFixed(2)}
Inventory Cost Basis (Purchase Cost): $${metrics.totalCostValue.toFixed(2)}
Total Recorded Revenue: $${metrics.totalRevenue.toFixed(2)}
Total Purchases Expenditure: $${metrics.totalPurchasesAmount.toFixed(2)}
Total Net Profit: $${metrics.totalProfit.toFixed(2)}
Average Margin: ${metrics.averageProfitMargin.toFixed(1)}%
Suppliers Count: ${metrics.totalSuppliers}

ITEMS NEEDING REORDER:
${lowStockList || 'All inventory items are currently above threshold.'}

TOP SELLING PRODUCTS:
${topSellersList || 'No sales recorded.'}

ACTIVE SUPPLIERS:
${suppliersList || 'No suppliers registered.'}

RECENT SALES ACTIVITY:
${recentSalesList || 'No recent sales.'}`;
  };

  // AI Chat Operations
  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const currentConv = activeConversation;
    if (!currentConv) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toISOString(),
      responseMode: aiSettings.responseMode,
      analysisFocus: aiSettings.analysisFocus,
    };

    const isFirstUserMsg =
      currentConv.messages.filter((m) => m.role === 'user').length === 0;

    let updatedTitle = currentConv.title;
    if (
      isFirstUserMsg ||
      currentConv.title.toLowerCase().startsWith('new ') ||
      currentConv.title === 'New Inventory Audit'
    ) {
      const cleanPrompt = userText.trim();
      updatedTitle =
        cleanPrompt.length > 38 ? cleanPrompt.slice(0, 35).trim() + '...' : cleanPrompt;
    }

    const updatedMessages = [...currentConv.messages, userMessage];

    const intermediateConv: Conversation = {
      ...currentConv,
      title: updatedTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === currentConv.id ? intermediateConv : c))
    );
    persistConversationToDB(intermediateConv);

    setIsAiStreaming(true);

    try {
      const liveSnapshot = generateLiveBusinessSnapshot();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          systemContext: liveSnapshot,
          responseMode: aiSettings.responseMode,
          analysisFocus: aiSettings.analysisFocus,
          model: aiSettings.model,
          customApiKey: aiSettings.customApiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errMessage = data.message || 'An error occurred during AI completion.';
        if (data.error === 'MODEL_UNAVAILABLE') {
          errMessage = `⚠️ Model Verification Alert: Model "${data.requestedModel}" is not available on your Groq endpoint. Available models in your account: ${
            data.availableModels?.join(', ') || 'None found'
          }. Please select an available model in Settings.`;
        }

        const errorReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: errMessage,
          timestamp: new Date().toISOString(),
          isError: true,
        };

        const errorConv: Conversation = {
          ...currentConv,
          title: updatedTitle,
          messages: [...updatedMessages, errorReply],
          updatedAt: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === currentConv.id ? errorConv : c))
        );
        persistConversationToDB(errorConv);
        return;
      }

      const aiReplyMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        responseMode: aiSettings.responseMode,
        analysisFocus: aiSettings.analysisFocus,
        modelUsed: data.modelUsed,
      };

      const finalConv: Conversation = {
        ...currentConv,
        title: updatedTitle,
        messages: [...updatedMessages, aiReplyMessage],
        updatedAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === currentConv.id ? finalConv : c))
      );
      persistConversationToDB(finalConv);
    } catch (err: any) {
      console.error('Chat error:', err);
      const networkError: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `⚠️ Network Connection Error: Could not reach the StockWise backend server at /api/chat. Please ensure the dev server is active.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      const netErrConv: Conversation = {
        ...currentConv,
        title: updatedTitle,
        messages: [...updatedMessages, networkError],
        updatedAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === currentConv.id ? netErrConv : c))
      );
      persistConversationToDB(netErrConv);
    } finally {
      setIsAiStreaming(false);
    }
  };

  const regenerateLastMessage = async () => {
    const currentConv = activeConversation;
    if (!currentConv || currentConv.messages.length === 0) return;

    const lastUserIndex = [...currentConv.messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const targetIndex = currentConv.messages.length - 1 - lastUserIndex;
    const truncated = currentConv.messages.slice(0, targetIndex + 1);

    setConversations((prev) =>
      prev.map((c) => (c.id === currentConv.id ? { ...c, messages: truncated } : c))
    );

    setIsAiStreaming(true);

    try {
      const liveSnapshot = generateLiveBusinessSnapshot();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: truncated.map((m) => ({ role: m.role, content: m.content })),
          systemContext: liveSnapshot,
          responseMode: aiSettings.responseMode,
          analysisFocus: aiSettings.analysisFocus,
          model: aiSettings.model,
          customApiKey: aiSettings.customApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Regeneration failed');
      }

      const reply: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConv.id ? { ...c, messages: [...truncated, reply] } : c
        )
      );
    } catch (e: any) {
      // Retain state
    } finally {
      setIsAiStreaming(false);
    }
  };

  const createNewConversation = (initialPrompt?: string): string => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: initialPrompt
        ? initialPrompt.length > 35
          ? initialPrompt.slice(0, 32) + '...'
          : initialPrompt
        : 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveTab('assistant');
    persistConversationToDB(newConv);

    if (initialPrompt) {
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 50);
    }

    return newId;
  };

  const renameConversation = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c))
    );

    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
    } catch (e) {
      console.warn('Failed to rename conversation in SQLite:', e);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete conversation from SQLite:', e);
    }

    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh: Conversation = {
          id: `conv-${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        setActiveConversationId(fresh.id);
        persistConversationToDB(fresh);
        return [fresh];
      }
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
      return remaining;
    });
  };

  const clearCurrentConversation = () => {
    if (!activeConversation) return;
    const cleared: Conversation = {
      ...activeConversation,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? cleared : c))
    );
    persistConversationToDB(cleared);
  };

  // CSV Export Utility
  const exportCSV = (type: 'inventory' | 'sales' | 'purchases' | 'suppliers') => {
    let payloadData: any[] = [];
    if (type === 'inventory') payloadData = products;
    else if (type === 'sales') payloadData = sales;
    else if (type === 'purchases') payloadData = purchases;
    else if (type === 'suppliers') payloadData = suppliers;

    fetch('/api/export/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data: payloadData }),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stockwise_${type}_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((err) => console.error('Export error:', err));
  };

  const exportConversationJSON = () => {
    if (!activeConversation) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeConversation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stockwise_chat_${activeConversation.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setConversations([INITIAL_CONVERSATION]);
    setActiveConversationId(INITIAL_CONVERSATION.id);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const setAccentColor = (c: AccentColor) => {
    setAccentColorState(c);
  };

  const setResponseMode = (mode: ResponseMode) => {
    setAiSettings((prev) => ({ ...prev, responseMode: mode }));
  };

  const setAnalysisFocus = (focus: AnalysisFocus) => {
    setAiSettings((prev) => ({ ...prev, analysisFocus: focus }));
  };

  const setModel = (model: string) => {
    setAiSettings((prev) => ({ ...prev, model }));
  };

  const setCustomApiKey = (key: string) => {
    setAiSettings((prev) => ({ ...prev, customApiKey: key.trim() }));
  };

  const toggleLeftPanel = () => setIsLeftPanelOpen((prev) => !prev);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <BusinessContext.Provider
      value={{
        products,
        suppliers,
        sales,
        purchases,
        notifications,
        conversations,
        activeConversation,
        activeConversationId,
        activeTab,
        aiSettings,
        metrics,
        user,
        theme,
        accentColor,
        isLeftPanelOpen,
        isAiStreaming,
        groqStatus,
        setActiveTab,
        setActiveConversationId,
        setTheme,
        toggleTheme,
        setAccentColor,
        setResponseMode,
        setAnalysisFocus,
        setModel,
        setCustomApiKey,
        toggleLeftPanel,
        updateUserProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordSale,
        recordPurchase,
        markNotificationAsRead,
        clearAllNotifications,
        sendMessage,
        createNewConversation,
        renameConversation,
        deleteConversation,
        clearCurrentConversation,
        regenerateLastMessage,
        checkGroqStatus,
        exportCSV,
        exportConversationJSON,
        resetToDemoData,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
