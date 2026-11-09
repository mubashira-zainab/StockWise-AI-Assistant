/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  costPrice: number; // Purchase price
  sellingPrice: number;
  stockQuantity: number; // Available quantity
  minStockLevel: number; // Minimum stock level
  supplier: string; // Supplier name or ID
  supplierId?: string;
  dateAdded: string; // Date added
  salesCount: number;
  lastRestocked: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  associatedProductIds: string[];
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number; // e.g. 52.4
  date: string;
  customer?: string;
  paymentMethod: 'Card' | 'Cash' | 'Transfer' | 'Online';
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  date: string;
  status: 'Received' | 'Pending' | 'Ordered';
  notes?: string;
}

export interface AppNotification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'sale_success' | 'purchase_success' | 'inventory_update' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: ActiveTab;
}

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice?: number;
  totalAmount?: number;
  notes?: string;
  timestamp: string;
}

export type ResponseMode = 'concise' | 'balanced' | 'detailed';
export type AnalysisFocus = 'inventory' | 'sales' | 'profitability' | 'restocking' | 'all';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  responseMode?: ResponseMode;
  analysisFocus?: AnalysisFocus;
  modelUsed?: string;
  isError?: boolean;
  actionExecuted?: {
    type: 'add_product' | 'update_product' | 'delete_product' | 'stock_in' | 'stock_out' | 'adjustment';
    productName: string;
    details: string;
  };
  pendingConfirmation?: {
    action: 'delete_product';
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface BusinessMetrics {
  totalProducts: number;
  totalInventoryQuantity: number;
  totalInventoryValue: number; // based on selling price
  totalCostValue: number; // based on purchase cost
  totalRevenue: number;
  totalPurchasesAmount: number;
  totalProfit: number;
  averageProfitMargin: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSuppliers: number;
  recentSalesCount: number;
  recentPurchasesCount: number;
  topSellingProducts: {
    product: Product;
    unitsSold: number;
    revenue: number;
    profit: number;
  }[];
  lowStockProducts: Product[];
  categoryBreakdown: {
    category: string;
    productCount: number;
    inventoryValue: number;
  }[];
  monthlyPerformance: {
    month: string;
    revenue: number;
    purchases: number;
    profit: number;
  }[];
}

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'indigo' | 'amber' | 'rose';

export interface AISettings {
  responseMode: ResponseMode;
  analysisFocus: AnalysisFocus;
  model: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'Administrator' | 'Manager' | 'Analyst';
  businessName: string;
  photoURL?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'inventory'
  | 'suppliers'
  | 'sales'
  | 'purchases'
  | 'assistant'
  | 'analytics'
  | 'settings';
