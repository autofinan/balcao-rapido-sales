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
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { ExpensesView } from "@/components/expenses/ExpensesView";

type View = "dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "stock-adjustment" | "reports" | "budgets" | "expenses";

export default function Index() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Layout usando Grid - SEM margin-left problemático */}
      <div className="min-h-screen bg-background">
        
        {/* Sidebar Mobile - Overlay completo */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar Mobile */}
            <div className="fixed top-0 left-0 h-full w-72 bg-background border-r z-50 lg:hidden">
              <AppSidebar 
                currentView={currentView} 
                onViewChange={(view) => {
                  setCurrentView(view);
                  setSidebarOpen(false); // Fecha após selecionar
                }}
                onCloseMobile={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}
        
        {/* Layout Desktop: Grid com sidebar fixa */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] min-h-screen">
          
          {/* Sidebar Desktop - Dentro do Grid */}
          <aside className="hidden lg:block bg-background border-r">
            <AppSidebar 
              currentView={currentView} 
              onViewChange={setCurrentView}
            />
          </aside>
          
          {/* Container Principal - Sem margin-left */}
          <div className="flex flex-col min-h-screen">
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
          
        </div>
      </div>
    </SidebarProvider>
  );
}
