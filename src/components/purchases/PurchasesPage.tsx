/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  FileDown,
  DollarSign,
  PackagePlus,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { getAccentClasses } from '../../utils/accentStyles';

export const PurchasesPage: React.FC = () => {
  const { purchases, suppliers, products, recordPurchase, exportCSV, accentColor, metrics } = useBusiness();
  const accentStyles = getAccentClasses(accentColor);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<string>(products[0]?.costPrice.toString() || '20.00');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const totalEstimatedAmount = (parseFloat(unitCost) || 0) * quantity;

  const handleOpenModal = () => {
    if (suppliers.length > 0) setSelectedSupplierId(suppliers[0].id);
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setUnitCost(products[0].costPrice.toString());
    }
    setQuantity(10);
    setNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitCost(prod.costPrice.toString());
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(unitCost);
    if (!selectedSupplierId || !selectedProductId || quantity <= 0 || isNaN(cost) || cost <= 0) {
      setErrorMsg('Please enter valid product, quantity and unit cost.');
      return;
    }

    const result = recordPurchase({
      supplierId: selectedSupplierId,
      productId: selectedProductId,
      quantity,
      unitCost: cost,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to record purchase.');
      return;
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#070B18]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Purchases & Stock Procurement
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Log purchase orders, replenish stock inventories automatically, and monitor supplier commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV('purchases')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Purchases</span>
          </button>

          <button
            onClick={handleOpenModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl transition-colors shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            <span>Record New Purchase</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Procurement Spend</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            ${metrics.totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{purchases.length} total purchase orders recorded</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Units Replenished</span>
            <PackagePlus className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            {purchases.reduce((acc, p) => acc + p.quantity, 0)} units
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Directly added to warehouse inventory</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Suppliers</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-2">
            {suppliers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Verified vendor partners</div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Procurement & Purchase History
          </h2>
          <span className="text-xs text-slate-400 font-mono">{purchases.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#070B18]/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Units Added</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                purchases.map((pc) => (
                  <tr key={pc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{pc.id}</div>
                      <div>{new Date(pc.date).toLocaleDateString()}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div>{pc.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{pc.sku}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {pc.supplierName}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                      +{pc.quantity}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      ${pc.unitCost.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      ${pc.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {pc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 truncate max-w-[160px]">
                      {pc.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">Record Stock Purchase</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRecordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Select Product to Restock *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stockQuantity} units)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Quantity to Receive *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Agreed Unit Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Procurement Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="PO reference number, shipping notes..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Live Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Current Product Stock:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{selectedProduct?.stockQuantity || 0} units</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Stock After Receipt:</span>
                  <span className="font-mono">+{(selectedProduct?.stockQuantity || 0) + quantity} units</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Purchase Cost:</span>
                  <span className="font-mono">${totalEstimatedAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl font-semibold shadow-xs`}
                >
                  Receive Stock & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
