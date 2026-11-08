/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  FileDown,
  DollarSign,
  Receipt,
  Search,
  CreditCard,
  Percent,
  X,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { getAccentClasses } from '../../utils/accentStyles';

export const SalesPage: React.FC = () => {
  const { sales, products, recordSale, exportCSV, accentColor, metrics } = useBusiness();
  const accentStyles = getAccentClasses(accentColor);

  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Transfer' | 'Online'>('Card');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Live preview calculation
  const unitPrice = selectedProduct?.sellingPrice || 0;
  const unitCost = selectedProduct?.costPrice || 0;
  const previewRevenue = unitPrice * quantity;
  const previewCost = unitCost * quantity;
  const previewProfit = previewRevenue - previewCost;
  const previewMargin = previewRevenue > 0 ? ((previewProfit / previewRevenue) * 100).toFixed(1) : '0';

  const handleOpenModal = () => {
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    setQuantity(1);
    setCustomer('');
    setPaymentMethod('Card');
    setErrorMessage('');
    setIsRecordModalOpen(true);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    const result = recordSale({
      productId: selectedProductId,
      quantity,
      customer: customer.trim() || undefined,
      paymentMethod,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to record transaction');
      return;
    }

    setIsRecordModalOpen(false);
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.sku.toLowerCase().includes(search.toLowerCase()) ||
      (s.customer && s.customer.toLowerCase().includes(search.toLowerCase()));

    const matchesPayment = selectedPayment === 'All' || s.paymentMethod === selectedPayment;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#070B18]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sales & Customer Orders
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Record customer purchases, automatically adjust inventory levels, and track transaction profitability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV('sales')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Sales CSV</span>
          </button>

          <button
            onClick={handleOpenModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl transition-colors shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{sales.length} transactions completed</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gross Profit</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-2">
            +${metrics.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cost: ${metrics.totalCostValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Margin</span>
            <Percent className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            {metrics.averageProfitMargin.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Overall profitability return</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Units Dispatched</span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            {sales.reduce((acc, s) => acc + s.quantity, 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Physical stock units delivered</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or customer..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <select
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden"
        >
          <option value="All">All Payment Methods</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="Transfer">Bank Transfer</option>
          <option value="Online">Online Gateway</option>
        </select>
      </div>

      {/* Sales Transactions Ledger */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Sales Transaction Records
          </h2>
          <span className="text-xs text-slate-400 font-mono">{filteredSales.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#070B18]/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Profit</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions matching your query.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div>{s.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.sku}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {s.quantity}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      ${s.unitPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      ${s.totalRevenue.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                      +${s.profit.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {s.profitMargin.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {s.customer || 'Walk-in'}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {s.paymentMethod}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Sale Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">Record Customer Sale</h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRecordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                      {p.name} — ${p.sellingPrice.toFixed(2)} ({p.stockQuantity} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Quantity Sold *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.stockQuantity || 1}
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1));
                      setErrorMessage('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Available in warehouse: {selectedProduct?.stockQuantity || 0}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Online">Online Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Customer / Client</label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. Apex Design Studio, Jane Doe"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Real-Time Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Revenue:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">${previewRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Calculated Cost:</span>
                  <span className="font-mono">${previewCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Calculated Net Profit:</span>
                  <span className="font-mono">+${previewProfit.toFixed(2)} ({previewMargin}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProduct || selectedProduct.stockQuantity === 0}
                  className={`px-4 py-2 text-white ${accentStyles.bg} ${accentStyles.hoverBg} disabled:opacity-50 rounded-xl font-semibold shadow-xs`}
                >
                  Confirm Sale & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
