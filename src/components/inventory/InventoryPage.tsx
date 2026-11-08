/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  FileDown,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  X,
  Check,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Product } from '../../types';
import { getAccentClasses } from '../../utils/accentStyles';

export const InventoryPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    suppliers,
    exportCSV,
    setActiveTab,
    sendMessage,
    accentColor,
    metrics,
  } = useBusiness();

  const accentStyles = getAccentClasses(accentColor);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Low' | 'Out' | 'In'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    description: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockLevel: '10',
    supplier: '',
    dateAdded: new Date().toISOString().slice(0, 10),
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering & Sorting
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStatus = true;
      if (selectedStatus === 'Low') matchesStatus = p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0;
      else if (selectedStatus === 'Out') matchesStatus = p.stockQuantity === 0;
      else if (selectedStatus === 'In') matchesStatus = p.stockQuantity > p.minStockLevel;

      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortBy === 'name') result = a.name.localeCompare(b.name);
      else if (sortBy === 'quantity') result = a.stockQuantity - b.stockQuantity;
      else if (sortBy === 'price') result = a.sellingPrice - b.sellingPrice;
      else if (sortBy === 'date') result = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      return sortOrder === 'asc' ? result : -result;
    });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      category: 'Electronics',
      description: '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: '',
      minStockLevel: '10',
      supplier: suppliers[0]?.name || 'Apex Peripherals Ltd',
      dateAdded: new Date().toISOString().slice(0, 10),
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: p.description || '',
      costPrice: p.costPrice.toString(),
      sellingPrice: p.sellingPrice.toString(),
      stockQuantity: p.stockQuantity.toString(),
      minStockLevel: p.minStockLevel.toString(),
      supplier: p.supplier,
      dateAdded: p.dateAdded || new Date().toISOString().slice(0, 10),
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const cost = parseFloat(formData.costPrice) || 0;
    const price = parseFloat(formData.sellingPrice) || 0;
    const quantity = parseInt(formData.stockQuantity, 10) || 0;
    const minLevel = parseInt(formData.minStockLevel, 10) || 5;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        description: formData.description,
        costPrice: cost,
        sellingPrice: price,
        stockQuantity: quantity,
        minStockLevel: minLevel,
        supplier: formData.supplier,
        dateAdded: formData.dateAdded,
      });
    } else {
      addProduct({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        description: formData.description,
        costPrice: cost,
        sellingPrice: price,
        stockQuantity: quantity,
        minStockLevel: minLevel,
        supplier: formData.supplier,
        dateAdded: formData.dateAdded,
        lastRestocked: formData.dateAdded,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleAskAI = (p: Product) => {
    setActiveTab('assistant');
    sendMessage(`Analyze product "${p.name}" (SKU: ${p.sku}). Current stock: ${p.stockQuantity}, Min threshold: ${p.minStockLevel}, Cost: $${p.costPrice.toFixed(2)}, Price: $${p.sellingPrice.toFixed(2)}. Provide restocking recommendations and profitability advice.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#070B18]">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory Management
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Maintain product catalog, pricing, SKU records, available units, and safety stock thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV('inventory')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl transition-colors shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or supplier..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock ({metrics.lowStockCount})</option>
            <option value="Out">Out of Stock ({metrics.outOfStockCount})</option>
            <option value="In">Healthy Stock</option>
          </select>

          {/* Sort Field */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden"
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="price">Sort by Price</option>
            <option value="date">Sort by Date Added</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-slate-50 dark:bg-[#070B18] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#070B18]/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Purchase Cost</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const marginPct = p.sellingPrice > 0
                    ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1)
                    : '0';

                  const isOut = p.stockQuantity === 0;
                  const isLow = p.stockQuantity <= p.minStockLevel && !isOut;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.sku}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.category}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500">
                        ${p.costPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                        {marginPct}%
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`font-mono tabular-nums font-bold ${
                              isOut
                                ? 'text-rose-600 dark:text-rose-400'
                                : isLow
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {p.stockQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            / min {p.minStockLevel}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                        {p.supplier}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleAskAI(p)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                          title="Ask StockWise AI"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base">Confirm Product Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove this product from your inventory catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base">{viewingProduct.name}</h3>
                <span className="text-xs font-mono text-slate-400">SKU: {viewingProduct.sku}</span>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Description</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {viewingProduct.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Purchase Price</span>
                  <span className="text-sm font-bold font-mono">${viewingProduct.costPrice.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Selling Price</span>
                  <span className="text-sm font-bold font-mono">${viewingProduct.sellingPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Available Inventory</span>
                  <span className="text-sm font-bold font-mono">{viewingProduct.stockQuantity} units</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Min threshold: {viewingProduct.minStockLevel}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Calculated Valuation</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${(viewingProduct.stockQuantity * viewingProduct.sellingPrice).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Profit margin: {(((viewingProduct.sellingPrice - viewingProduct.costPrice) / viewingProduct.sellingPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px]">Supplier</span>
                  <div className="font-semibold">{viewingProduct.supplier}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Date Added</span>
                  <div className="font-mono text-slate-600 dark:text-slate-300">{viewingProduct.dateAdded}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setViewingProduct(null);
                  handleAskAI(viewingProduct);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white ${accentStyles.bg} rounded-xl`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About Item</span>
              </button>

              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Ergonomic Mechanical Keyboard"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product specs, features, and warehouse handling..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Purchase Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="45.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="119.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Available Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Minimum Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    placeholder="8"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Supplier</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Date Added</label>
                  <input
                    type="date"
                    value={formData.dateAdded}
                    onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl font-semibold shadow-xs`}
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
