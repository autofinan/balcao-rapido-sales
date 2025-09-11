// src/pages/Index.tsx

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
// 👈 CORREÇÃO AQUI: Remove a pasta duplicada 'Budgets'
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
      <div className="flex min-h-screen bg-background">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
