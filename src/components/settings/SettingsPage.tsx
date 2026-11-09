/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Palette,
  Sun,
  Moon,
  Bell,
  Cpu,
  Database,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { AccentColor, ResponseMode } from '../../types';
import { getAccentClasses } from '../../utils/accentStyles';

export const SettingsPage: React.FC = () => {
  const {
    user,
    updateUserProfile,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    aiSettings,
    setResponseMode,
    setModel,
    resetToDemoData,
  } = useBusiness();

  const accentStyles = getAccentClasses(accentColor);

  const [profileSaved, setProfileSaved] = useState(false);

  // Profile Form
  const [name, setName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [role, setRole] = useState(user.role);

  // Notifications toggles
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifSales, setNotifSales] = useState(true);
  const [notifPurchases, setNotifPurchases] = useState(true);

  const [resetConfirm, setResetConfirm] = useState(false);

  const accentOptions: { id: AccentColor; name: string; hex: string }[] = [
    { id: 'blue', name: 'Royal Blue', hex: '#2563EB' },
    { id: 'purple', name: 'Vibrant Purple', hex: '#7C3AED' },
    { id: 'emerald', name: 'Emerald Green', hex: '#059669' },
    { id: 'indigo', name: 'Deep Indigo', hex: '#4F46E5' },
    { id: 'amber', name: 'Warm Amber', hex: '#D97706' },
    { id: 'rose', name: 'Rose Red', hex: '#E11D48' },
  ];

  const supportedGroqModels = [
    { id: 'openai/gpt-oss-20b', name: 'openai/gpt-oss-20b (Configured Initial Model)', desc: 'Configured initial Groq chat-completion model.' },
    { id: 'llama-3.3-70b-versatile', name: 'llama-3.3-70b-versatile (Meta)', desc: 'High-reasoning model for complex multi-product audits and profit margin advice.' },
    { id: 'llama-3.1-8b-instant', name: 'llama-3.1-8b-instant (Meta)', desc: 'Ultra-fast inference model with low latency.' },
    { id: 'mixtral-8x7b-32768', name: 'mixtral-8x7b-32768 (Mistral AI)', desc: 'Strong multi-step analytical model with 32k context.' },
    { id: 'gemma2-9b-it', name: 'gemma2-9b-it (Google)', desc: 'Compact high-speed Google model.' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: name,
      email,
      businessName,
      role: role as any,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#070B18] max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System & Account Settings
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Configure Groq AI models, theme appearance, user credentials, and database connectivity.
        </p>
      </div>

      {/* 1. Database & Cloud Architecture Status */}
      <section className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Database & Storage Architecture
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
            Local Persistent Store Active
          </span>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 leading-relaxed space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-blue-900 dark:text-blue-100">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Database Status Information</span>
          </div>
          <p>
            Firebase Firestore and Authentication were not enabled during setup. To ensure your business operations remain 100% functional, StockWise AI is running with <strong>Isolated Persistent Storage</strong>.
          </p>
          <p className="text-[11px] text-blue-700 dark:text-blue-300">
            All product catalogs, supplier records, purchase orders, sales transactions, and AI chat histories are saved and persisted across sessions.
          </p>
        </div>
      </section>

      {/* 2. Groq AI Integration & Model Architecture */}
      <section className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Groq AI Engine & Model Architecture
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              Server Key Active
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-xs text-purple-950 dark:text-purple-200 leading-relaxed space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-purple-900 dark:text-purple-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Server-Side Authentication Configured</span>
          </div>
          <p>
            Groq API integration is securely managed on the backend via the server environment (<code className="font-mono text-purple-700 dark:text-purple-300 font-bold">GROQ_API_KEY</code>). All chatbot completions are processed through secure serverless endpoints. Users never need to supply or manage API keys.
          </p>
        </div>

        {/* Model Selection */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-medium">
            Active Chat Completion Model
          </label>
          <div className="space-y-2">
            {supportedGroqModels.map((m) => {
              const isSelected = aiSettings.model === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-[#070B18] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className={isSelected ? 'text-blue-600 dark:text-blue-400' : ''}>{m.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Appearance & Theme Customization */}
      <section className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Interface Appearance & Theme
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Theme Mode */}
          <div className="space-y-2">
            <label className="block text-slate-700 dark:text-slate-300 font-medium">Theme Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-slate-50 dark:bg-[#070B18] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light (Default)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-950/60 border-blue-500 text-white'
                    : 'bg-slate-50 dark:bg-[#070B18] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2">
            <label className="block text-slate-700 dark:text-slate-300 font-medium">Accent Color</label>
            <div className="grid grid-cols-3 gap-2">
              {accentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAccentColor(opt.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
                    accentColor === opt.id
                      ? 'border-slate-900 dark:border-white font-bold bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: opt.hex }} />
                  <span className="truncate">{opt.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Response Mode Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-medium">
            AI Assistant Default Length Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['concise', 'balanced', 'detailed'] as ResponseMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setResponseMode(mode)}
                className={`py-2 px-3 text-xs font-medium rounded-xl capitalize transition-colors ${
                  aiSettings.responseMode === mode
                    ? `${accentStyles.bg} text-white font-semibold shadow-xs`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. User Profile & Business Identity */}
      <section className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Profile & Account Management
            </h2>
          </div>
          {profileSaved && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Profile updated!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="Administrator">Administrator</option>
                <option value="Manager">Inventory Manager</option>
                <option value="Analyst">Business Analyst</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl shadow-xs`}
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </section>

      {/* 5. Notification Preferences */}
      <section className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            System Alerts & Notification Settings
          </h2>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Low-Stock Warnings</div>
              <div className="text-[11px] text-slate-400">Trigger alerts when items dip below min threshold</div>
            </div>
            <input
              type="checkbox"
              checked={notifLowStock}
              onChange={(e) => setNotifLowStock(e.target.checked)}
              className="w-4 h-4 rounded-sm text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Sale Transaction Confirmations</div>
              <div className="text-[11px] text-slate-400">Notify upon successful customer order dispatch</div>
            </div>
            <input
              type="checkbox"
              checked={notifSales}
              onChange={(e) => setNotifSales(e.target.checked)}
              className="w-4 h-4 rounded-sm text-blue-600 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Purchase Order Receipts</div>
              <div className="text-[11px] text-slate-400">Notify when supplier orders are received into stock</div>
            </div>
            <input
              type="checkbox"
              checked={notifPurchases}
              onChange={(e) => setNotifPurchases(e.target.checked)}
              className="w-4 h-4 rounded-sm text-blue-600 focus:ring-0"
            />
          </label>
        </div>
      </section>

      {/* 6. Demo Data Reset & Account Reset */}
      <section className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Management & Reset
            </h2>
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          Restore initial verified catalog items (12 products, 7 suppliers, historical sales and purchase orders).
        </p>

        {resetConfirm ? (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                resetToDemoData();
                setResetConfirm(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100"
          >
            Reset Sample Dataset
          </button>
        )}
      </section>
    </div>
  );
};
