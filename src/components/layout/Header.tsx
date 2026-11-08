/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Palette,
  Check,
  X,
  ExternalLink,
  Database,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { AccentColor, ActiveTab } from '../../types';
import { getAccentClasses } from '../../utils/accentStyles';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    accentColor,
    setAccentColor,
    toggleLeftPanel,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    user,
    metrics,
  } = useBusiness();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);

  const accentStyles = getAccentClasses(accentColor);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const accentOptions: { id: AccentColor; name: string; hex: string }[] = [
    { id: 'blue', name: 'Royal Blue', hex: '#2563EB' },
    { id: 'purple', name: 'Vibrant Purple', hex: '#7C3AED' },
    { id: 'emerald', name: 'Emerald Green', hex: '#059669' },
    { id: 'indigo', name: 'Deep Indigo', hex: '#4F46E5' },
    { id: 'amber', name: 'Warm Amber', hex: '#D97706' },
    { id: 'rose', name: 'Rose Red', hex: '#E11D48' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (accentRef.current && !accentRef.current.contains(e.target as Node)) {
        setShowAccentPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Executive Dashboard';
      case 'inventory':
        return 'Inventory Management';
      case 'suppliers':
        return 'Supplier Directory';
      case 'sales':
        return 'Sales & Orders';
      case 'purchases':
        return 'Purchases & Procurement';
      case 'assistant':
        return 'StockWise AI Assistant';
      case 'analytics':
        return 'Analytics & Reports';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 z-20 shrink-0 transition-colors">
      {/* Left: Mobile menu button + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLeftPanel}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-medium text-slate-400">StockWise</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
          <h1 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {getBreadcrumbTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Database Status indicator */}
        <div
          onClick={() => setActiveTab('settings')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          title="Database: Persistent Storage Active (Firebase Unconfigured)"
        >
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Local Store Active</span>
        </div>

        {/* Accent Color Picker */}
        <div className="relative" ref={accentRef}>
          <button
            onClick={() => setShowAccentPicker(!showAccentPicker)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Customize Accent Color"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showAccentPicker && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Accent Theme Color
              </span>
              <div className="space-y-1">
                {accentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAccentColor(opt.id);
                      setShowAccentPicker(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      accentColor === opt.id ? 'font-semibold bg-slate-50 dark:bg-slate-800/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: opt.hex }} />
                      <span>{opt.name}</span>
                    </div>
                    {accentColor === opt.id && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Mode Switch */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                        n.read
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                          : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                          {n.type === 'out_of_stock' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                          {n.type === 'low_stock' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {n.type === 'sale_success' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {n.type === 'purchase_success' && <ShoppingBag className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          <span>{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Tag */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
        >
          <div className={`w-8 h-8 rounded-full ${accentStyles.bg} flex items-center justify-center text-white text-xs font-semibold shadow-xs`}>
            {user.displayName.charAt(0)}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {user.displayName}
            </div>
            <div className="text-[10px] text-slate-400 leading-none mt-0.5">
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
