/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileDown,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';
import { getAccentClasses } from '../../utils/accentStyles';

export const AnalyticsPage: React.FC = () => {
  const { metrics, products, sales, purchases, exportCSV, accentColor } = useBusiness();
  const accentStyles = getAccentClasses(accentColor);

  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');

  // Profit Margins by Product (Top 6)
  const productProfitabilityData = products
    .filter((p) => p.sellingPrice > 0)
    .map((p) => {
      const margin = Number((((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1));
      const profitPerUnit = Number((p.sellingPrice - p.costPrice).toFixed(2));
      return {
        name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
        margin,
        profitPerUnit,
        price: p.sellingPrice,
      };
    })
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 6);

  // Stock Movement & Inventory Value by Category
  const categoryStockData = metrics.categoryBreakdown.map((c) => ({
    category: c.category,
    valuation: c.inventoryValue,
    count: c.productCount,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#070B18]">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Financial & Inventory Analytics
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            In-depth analysis of revenue, capital procurement, gross margins, and category valuation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Segmented Control */}
          <div className="flex items-center p-1 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                timeRange === '30d'
                  ? `${accentStyles.bg} text-white shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                timeRange === '90d'
                  ? `${accentStyles.bg} text-white shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                timeRange === 'all'
                  ? `${accentStyles.bg} text-white shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => exportCSV('sales')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Gross Revenue</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            +18.4% vs previous cycle
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Procurement Spend</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            ${metrics.totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {purchases.length} supplier orders placed
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Net Gross Profit</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-2">
            +${metrics.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Margin: {metrics.averageProfitMargin.toFixed(1)}% average
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Current Stock Valuation</span>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums mt-2">
            ${metrics.totalInventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Cost base: ${metrics.totalCostValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Chart 1: Revenue vs Procurement vs Net Profit (Multi-Bar / Area Chart) */}
      <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Revenue, Purchases & Net Profit Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Monthly cash flow comparison of cash in (Sales) vs cash out (Procurement) vs retained earnings (Profit).
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.monthlyPerformance} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" fill="#2563EB" name="Revenue ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="purchases" fill="#64748B" name="Purchases ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#059669" name="Profit ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Product Profitability & Category Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Analysis by Product */}
        <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Highest Margin Products (ROI %)
            </h2>
            <p className="text-xs text-slate-400">
              Products delivering the greatest percentage return per unit sold
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productProfitabilityData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} width={110} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Profit Margin']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="margin" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Movement Trends & Category Capital */}
        <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Inventory Capital by Category
            </h2>
            <p className="text-xs text-slate-400">
              Dollar valuation breakdown across catalog departments
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
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
                <Bar dataKey="valuation" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
