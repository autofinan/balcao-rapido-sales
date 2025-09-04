import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { DashboardStatsInteractive } from "@/components/layout/DashboardStatsInteractive";
import { ProductsView } from "@/components/products/ProductsView";
import { POSView } from "@/components/pos/POSView";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { SalesViewEnhanced } from "@/components/sales/SalesViewEnhanced";
import { BulkProductsView } from "@/components/products/BulkProductsView";
import { ImportCSVView } from "@/components/products/ImportCSVView";
import { FastSaleView } from "@/components/sales/FastSaleView";
import { StockAdjustmentView } from "@/components/inventory/StockAdjustmentView";
import { ReportsView } from "@/components/reports/ReportsView";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { ExpensesView } from "@/components/expenses/ExpensesView";

type View = "dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "fast-sale" | "stock-adjustment" | "reports" | "budgets" | "expenses";

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
      case "fast-sale":
        return <FastSaleView />;
      case "stock-adjustment":
        return <StockAdjustmentView />;
      case "reports":
        return <ReportsView />;
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
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}