/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Key,
  Cpu,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Eye,
  EyeOff,
  Cloud,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ResponseMode } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    aiSettings,
    setResponseMode,
    setModel,
    setCustomApiKey,
    theme,
    toggleTheme,
    resetToDemoData,
    groqStatus,
    checkGroqStatus,
  } = useBusiness();

  const [inputKey, setInputKey] = useState(aiSettings.customApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const supportedModels = [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile (Meta)',
      desc: 'State-of-the-art reasoning for complex inventory audits, profit margins, and predictive restocking.',
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant (Meta)',
      desc: 'Ultra-fast low-latency responses for quick answers and simple queries.',
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B (Mistral AI)',
      desc: 'High-speed model with strong multi-step tabular calculations and 32k context.',
    },
    {
      id: 'gemma2-9b-it',
      name: 'Gemma 2 9B IT (Google)',
      desc: 'Efficient, high-performance compact model.',
    },
  ];

  const handleSaveApiKey = () => {
    setCustomApiKey(inputKey);
    setSaveSuccess(true);
    checkGroqStatus();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    resetToDemoData();
    setResetConfirm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#070B18] dark:bg-[#070B18] light-mode-active:bg-slate-100 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white dark:text-white light-mode-active:text-slate-900 tracking-tight">
          Platform Settings & AI Configuration
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-400 dark:text-slate-400 light-mode-active:text-slate-600">
          Manage your Groq AI credentials, intelligence model, response preferences, and deployment setup.
        </p>
      </div>

      {/* Groq API Configuration Section */}
      <section className="p-5 bg-[#0F172A] dark:bg-[#0F172A] light-mode-active:bg-white border border-slate-800 dark:border-slate-800 light-mode-active:border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white dark:text-white light-mode-active:text-slate-900">
              Groq AI API Integration
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                groqStatus.configured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-slate-300">
              {groqStatus.configured ? 'Active' : 'Unconfigured'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          StockWise AI communicates securely server-side with Groq's high-speed LPU inference engine. You can configure your key in your server's <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded-sm">.env</code> file or provide a personal key below.
        </p>

        {saveSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Groq API Key updated successfully! Testing connection...</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Groq API Key
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full pl-3 pr-20 py-2.5 text-xs bg-[#070B18] dark:bg-[#070B18] light-mode-active:bg-slate-50 text-white dark:text-white light-mode-active:text-slate-900 placeholder:text-slate-600 border border-slate-800 dark:border-slate-800 light-mode-active:border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 p-1.5 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Free API keys available with zero credit card at console.groq.com</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Get Free Groq Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveApiKey}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
          >
            Save & Test Key
          </button>
        </div>
      </section>

      {/* AI Model Selection */}
      <section className="p-5 bg-[#0F172A] dark:bg-[#0F172A] light-mode-active:bg-white border border-slate-800 dark:border-slate-800 light-mode-active:border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white dark:text-white light-mode-active:text-slate-900">
            AI Model Selection
          </h2>
        </div>

        <div className="space-y-3">
          {supportedModels.map((m) => {
            const isSelected = aiSettings.model === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-600/70 text-slate-200'
                    : 'bg-[#070B18] dark:bg-[#070B18] light-mode-active:bg-slate-50 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-white dark:text-white light-mode-active:text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? 'text-blue-400' : 'text-slate-300'}>{m.name}</span>
                    {m.id.includes('70b') && (
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-mono">
                        Recommended
                      </span>
                    )}
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Response Length & Appearance */}
      <section className="p-5 bg-[#0F172A] dark:bg-[#0F172A] light-mode-active:bg-white border border-slate-800 dark:border-slate-800 light-mode-active:border-slate-200 rounded-xl space-y-4">
        <h2 className="text-sm font-semibold text-white dark:text-white light-mode-active:text-slate-900 pb-3 border-b border-slate-800/80">
          Preferences & Interface
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Response Mode */}
          <div className="space-y-2">
            <label className="block text-slate-400 font-medium">Default Response Mode</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#070B18] dark:bg-[#070B18] light-mode-active:bg-slate-200 border border-slate-800 rounded-lg">
              {(['concise', 'balanced', 'detailed'] as ResponseMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setResponseMode(mode)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md capitalize transition-colors ${
                    aiSettings.responseMode === mode
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Concise answers 1–3 sentences; Balanced gives 1–2 paragraphs; Detailed provides full breakdown.
            </p>
          </div>

          {/* Theme Switcher */}
          <div className="space-y-2">
            <label className="block text-slate-400 font-medium">Theme Mode</label>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-2.5 bg-[#070B18] dark:bg-[#070B18] light-mode-active:bg-slate-50 border border-slate-800 rounded-lg text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span className="capitalize">{theme} Mode Active</span>
              </span>
              <span className="text-[11px] text-blue-400">Toggle</span>
            </button>
          </div>
        </div>
      </section>

      {/* Production & Vercel Deployment Instructions */}
      <section className="p-5 bg-[#0F172A] dark:bg-[#0F172A] light-mode-active:bg-white border border-slate-800 dark:border-slate-800 light-mode-active:border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white dark:text-white light-mode-active:text-slate-900">
            Vercel & Production Deployment Guide
          </h2>
        </div>

        <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
          <p>
            When deploying StockWise AI to Vercel (or any Node.js hosting service):
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2 font-mono text-[11px] text-slate-300">
            <li>Open your Project on Vercel Dashboard → <strong>Settings</strong> → <strong>Environment Variables</strong>.</li>
            <li>Add <strong className="text-blue-400">GROQ_API_KEY</strong> with your key value from console.groq.com.</li>
            <li>Add <strong className="text-blue-400">GROQ_MODEL</strong> set to <code className="text-emerald-400">llama-3.3-70b-versatile</code>.</li>
            <li>Trigger a redeploy. StockWise AI's serverless endpoints in <code className="text-cyan-400">/api/*</code> will connect automatically.</li>
          </ol>
        </div>
      </section>

      {/* Data Management & Demo Reset */}
      <section className="p-5 bg-[#0F172A] dark:bg-[#0F172A] light-mode-active:bg-white border border-slate-800 dark:border-slate-800 light-mode-active:border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white dark:text-white light-mode-active:text-slate-900">
              Demo Data Reset
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Restore the initial realistic business catalog (12 products, 10 sales transactions, and sample restock thread). This will overwrite any custom added products.
        </p>

        {resetConfirm ? (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleResetData}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
            >
              Confirm & Reset All Data
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg transition-colors"
          >
            Reset to Sample Business Data
          </button>
        )}
      </section>
    </div>
  );
};
