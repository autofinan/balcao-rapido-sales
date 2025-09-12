// src/pages/Index.tsx - Versão Corrigida

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import { DashboardStatsInteractive } from "@/components/layout/DashboardStatsInteractive";
import { ProductsView } from "@/components/products/ProductsView";
import { POSView } from "@/components/pos/POSView";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { SalesViewEnhanced } from "@/components/sales/SalesViewEnhanced";
import { BulkProductsView } from "@/components/products/BulkProductsView";
import { ImportCSVView } from "@/components/products/ImportCSVView";
import { StockAdjustmentView } from "@/components/inventory/StockAdjustmentView";
import { ReportsViewEnhanced } from "@/components/reports/ReportsViewEnhanced";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { ExpensesView } from "@/components/expenses/ExpensesView";

type View = "dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "stock-adjustment" | "reports" | "budgets" | "expenses";

export default function Index() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral do seu negócio
              </p>
            </div>
            <DashboardStatsInteractive />
          </div>
        );
      case "pos":
        return <POSView />;
      case "products":
        return <ProductsView />;
      case "categories":
        return <CategoriesView />;
      case "sales":
        return <SalesViewEnhanced />;
      case "bulk-products":
        return <BulkProductsView />;
      case "import-csv":
        return <ImportCSVView />;
      case "stock-adjustment":
        return <StockAdjustmentView />;
      case "reports":
        return <ReportsViewEnhanced />;
      case "budgets":
        return <BudgetsView />;
      case "expenses":
        return <ExpensesView />;
      default:
        return <POSView />;
    }
  };

  return (
    <SidebarProvider>
      {/* Layout usando CSS Grid para controle preciso */}
      <div className="min-h-screen bg-background grid lg:grid-cols-[280px_1fr]">
        
        {/* Sidebar - Desktop: coluna fixa, Mobile: oculta */}
        <aside className="hidden lg:flex border-r bg-background">
          <AppSidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
          />
        </aside>
        
        {/* Container Principal */}
        <div className="flex flex-col min-h-screen overflow-hidden">
          
          {/* Header */}
          <Header />
          
          {/* Conteúdo Principal */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">
              {renderContent()}
            </div>
          </main>
          
        </div>
        
        {/* Sidebar Mobile - Overlay */}
        <div className="lg:hidden">
          <AppSidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
          />
        </div>
        
      </div>
    </SidebarProvider>
  );
}
