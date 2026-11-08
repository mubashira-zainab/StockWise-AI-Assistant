/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Truck,
  Sparkles,
  ArrowRight,
  Boxes,
  Plus,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';
import { getAccentClasses } from '../../utils/accentStyles';

const PIE_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#E11D48', '#06B6D4', '#4F46E5'];

export const DashboardPage: React.FC = () => {
  const { metrics, sales, purchases, setActiveTab, sendMessage, createNewConversation, accentColor } = useBusiness();
  const accentStyles = getAccentClasses(accentColor);

  const handleAskAI = (promptText: string) => {
    setActiveTab('assistant');
    sendMessage(promptText);
  };

  const handleRunFullAudit = () => {
    createNewConversation('Perform an executive audit of our current stock levels, profitability, low-stock risks, and supplier dependencies.');
  };

  // Prepare Pie Chart data from Category Breakdown
  const pieData = metrics.categoryBreakdown.map((cat) => ({
    name: cat.category,
    value: cat.inventoryValue,
  }));

  // Prepare Recent Activities (combine recent sales & purchases sorted by date)
  const recentActivities = [
    ...sales.map((s) => ({
      id: s.id,
      type: 'sale' as const,
      title: `Sale: ${s.quantity}x ${s.productName}`,
      amount: `+$${s.totalRevenue.toFixed(2)}`,
      profit: `+$${s.profit.toFixed(2)}`,
      date: s.date,
      partner: s.customer || 'Walk-in Customer',
    })),
    ...purchases.map((pc) => ({
      id: pc.id,
      type: 'purchase' as const,
      title: `Purchase: +${pc.quantity}x ${pc.productName}`,
      amount: `-$${pc.totalAmount.toFixed(2)}`,
      profit: null,
      date: pc.date,
      partner: pc.supplierName,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#070B18]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory & Sales Intelligence
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry across {metrics.totalProducts} catalog products, ${metrics.totalInventoryValue.toLocaleString()} inventory valuation, and {metrics.totalSuppliers} suppliers.
          </p>
        </div>

        <button
          onClick={handleRunFullAudit}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl transition-all shadow-md whitespace-nowrap self-start sm:self-auto`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Run AI Business Audit</span>
        </button>
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Products */}
        <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Products</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            {metrics.totalProducts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{metrics.totalInventoryQuantity} total units</div>
        </div>

        {/* Total Inventory Value */}
        <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Inventory Value</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            ${metrics.totalInventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cost: ${metrics.totalCostValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
        </div>

        {/* Total Sales */}
        <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Sales</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            ${metrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {metrics.averageProfitMargin.toFixed(1)}% margin
          </div>
        </div>

        {/* Low Stock Products */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          metrics.lowStockCount > 0
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
            : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Low Stock</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-2 ${
            metrics.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
          }`}>
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Below threshold</div>
        </div>

        {/* Out of Stock */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          metrics.outOfStockCount > 0
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
            : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Out of Stock</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.outOfStockCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-2 ${
            metrics.outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {metrics.outOfStockCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero units remaining</div>
        </div>

        {/* Total Suppliers */}
        <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Suppliers</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            {metrics.totalSuppliers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active partners</div>
        </div>
      </div>

      {/* Two Interactive Recharts Cards: Sales Overview & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Overview Chart (2 Columns) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Monthly Performance & Revenue Trends
              </h2>
              <p className="text-xs text-slate-400">
                Tracking monthly gross revenue, procurement expenditures, and net profits.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue ($)" />
                <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution Chart (1 Column) */}
        <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div>
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Inventory Value by Category
            </h2>
            <p className="text-xs text-slate-400">
              Distribution of current stock capital
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Valuation']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {metrics.categoryBreakdown.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate max-w-[120px]">{cat.category}</span>
                </div>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">
                  ${cat.inventoryValue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Low Stock Priority & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Low-Stock Replenishment Alerts
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all inventory
            </button>
          </div>

          <div className="space-y-2.5">
            {metrics.lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All inventory items are currently above minimum safety thresholds.
              </div>
            ) : (
              metrics.lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      SKU: {p.sku} · Supplier: {p.supplier}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-bold font-mono">
                      {p.stockQuantity === 0 ? (
                        <span className="text-rose-500">Out of Stock</span>
                      ) : (
                        <span className="text-amber-500">{p.stockQuantity} / min {p.minStockLevel}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAskAI(`What is the recommended reorder quantity and lead time for ${p.name}?`)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium block"
                    >
                      Ask AI restock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Top Selling Products by Revenue
            </h2>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all sales
            </button>
          </div>

          <div className="space-y-2.5">
            {metrics.topSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No sales recorded yet.
              </div>
            ) : (
              metrics.topSellingProducts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.unitsSold} units dispatched · SKU: {item.product.sku}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">
                      ${item.revenue.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      +${item.profit.toFixed(2)} profit
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Inventory Activities / Transactions Ledger */}
      <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Recent Inventory Activities & Transactions
            </h2>
            <p className="text-xs text-slate-400">
              Audit log of dispatched sales and stock procurement receipts
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'sale'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  }`}
                >
                  {act.type === 'sale' ? <TrendingUp className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{act.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {act.partner} · {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-mono font-bold ${
                    act.type === 'sale' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {act.amount}
                </div>
                {act.profit && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    {act.profit} profit
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
