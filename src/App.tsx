/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { SuppliersPage } from './components/suppliers/SuppliersPage';
import { SalesPage } from './components/sales/SalesPage';
import { PurchasesPage } from './components/purchases/PurchasesPage';
import { AssistantPage } from './components/assistant/AssistantPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { OfflineIndicator } from './components/OfflineIndicator';

function AppLayout() {
  const { activeTab } = useBusiness();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Viewport Canvas */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'suppliers' && <SuppliersPage />}
          {activeTab === 'sales' && <SalesPage />}
          {activeTab === 'purchases' && <PurchasesPage />}
          {activeTab === 'assistant' && <AssistantPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <BusinessProvider>
      <AppLayout />
    </BusinessProvider>
  );
}
