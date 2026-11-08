/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Truck,
  Receipt,
  ShoppingBag,
  Bot,
  BarChart3,
  Settings,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Clock,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ActiveTab, Conversation } from '../../types';
import { getAccentClasses } from '../../utils/accentStyles';
import { PWAInstallButton } from '../PWAInstallButton';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLeftPanelOpen,
    toggleLeftPanel,
    accentColor,
    metrics,
    user,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    renameConversation,
    deleteConversation,
  } = useBusiness();

  const accentStyles = getAccentClasses(accentColor);

  // Chat History inline states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: metrics.lowStockCount > 0 ? metrics.lowStockCount : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, badge: metrics.totalSuppliers },
    { id: 'sales', label: 'Sales & Orders', icon: Receipt },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'assistant', label: 'StockWise AI', icon: Bot, badge: 'AI' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const formatChatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (isYesterday) {
        return 'Yesterday';
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const handleStartRename = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handlePromptDelete = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setDeletingId(convId);
  };

  const handleConfirmDelete = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    deleteConversation(convId);
    setDeletingId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setActiveTab('assistant');
    if (window.innerWidth < 1024) toggleLeftPanel();
  };

  const handleNewChat = () => {
    createNewConversation();
    if (window.innerWidth < 1024) toggleLeftPanel();
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLeftPanelOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={toggleLeftPanel}
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
      />

      <aside className="fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none transition-colors">
        {/* Brand Lockup */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-xl ${accentStyles.bg} flex items-center justify-center text-white shadow-md`}>
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                StockWise <span className={accentStyles.text}>AI</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium leading-none">
                Enterprise BI Platform
              </div>
            </div>
          </div>

          <button
            onClick={toggleLeftPanel}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="p-3 flex-1 overflow-y-auto space-y-4">
          {/* Main Navigation Section */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
              Main Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) toggleLeftPanel();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? `${accentStyles.bg} text-white font-semibold shadow-sm`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor
                          ? item.badgeColor
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chat History Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Chat History</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                  {conversations.length}
                </span>
              </div>

              <button
                onClick={handleNewChat}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg text-white ${accentStyles.bg} hover:opacity-90 transition-opacity`}
                title="Create New Chat"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            {/* Quick Search if more than 3 chats */}
            {conversations.length > 3 && (
              <div className="px-2">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-7 pr-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Conversation List */}
            <div className="space-y-1 max-h-56 overflow-y-auto px-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-4 px-2 text-[11px] text-slate-400">
                  {searchQuery ? 'No matching conversations' : 'No previous chats yet.'}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isCurrent =
                    activeTab === 'assistant' && activeConversationId === conv.id;
                  const isEditing = editingId === conv.id;
                  const isDeleting = deletingId === conv.id;

                  if (isEditing) {
                    return (
                      <div
                        key={conv.id}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(e as any, conv.id);
                            if (e.key === 'Escape') handleCancelRename(e as any);
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-blue-500 rounded-md text-slate-900 dark:text-white focus:outline-hidden"
                        />
                        <button
                          onClick={(e) => handleSaveRename(e, conv.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md"
                          title="Save Title"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (isDeleting) {
                    return (
                      <div
                        key={conv.id}
                        className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-[11px] space-y-1.5"
                      >
                        <div className="text-rose-700 dark:text-rose-300 font-medium truncate">
                          Delete this chat?
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={handleCancelDelete}
                            className="px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => handleConfirmDelete(e, conv.id)}
                            className="px-2 py-0.5 text-[10px] bg-rose-600 text-white rounded-sm hover:bg-rose-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 text-xs rounded-xl cursor-pointer transition-all ${
                        isCurrent
                          ? `${accentStyles.lightBg} ${accentStyles.text} font-semibold border-l-2 ${accentStyles.border}`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-1">
                        <div
                          className="truncate text-xs font-medium leading-snug"
                          title={conv.title}
                        >
                          {conv.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span>{formatChatDate(conv.updatedAt || conv.createdAt)}</span>
                          <span>·</span>
                          <span>{conv.messages.length} msgs</span>
                        </div>
                      </div>

                      {/* Action buttons on hover */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => handleStartRename(e, conv)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                          title="Rename Chat"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handlePromptDelete(e, conv.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* AI Quick Banner */}
        <div className="p-3">
          <div
            onClick={() => {
              setActiveTab('assistant');
              if (window.innerWidth < 1024) toggleLeftPanel();
            }}
            className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-900 border border-blue-200 dark:border-slate-700/80 cursor-pointer hover:shadow-xs transition-shadow"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                StockWise Assistant
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Ask AI about stock forecasting, profit margins, and inventory health.
            </p>
          </div>
        </div>

        {/* Footer with PWA install & User Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <PWAInstallButton variant="sidebar" />

          <div className="flex items-center justify-between p-2 text-xs text-slate-500">
            <span className="truncate max-w-[140px]">{user.businessName}</span>
            <span className="text-[10px] font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

