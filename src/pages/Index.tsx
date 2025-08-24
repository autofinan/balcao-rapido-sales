import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProductsView } from "@/components/products/ProductsView";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { SalesView } from "@/components/sales/SalesView";
import { POSView } from "@/components/pos/POSView";
import { BulkProductsView } from "@/components/products/BulkProductsView";
import { ImportCSVView } from "@/components/products/ImportCSVView";
import { FastSaleView } from "@/components/sales/FastSaleView";
import { StockAdjustmentView } from "@/components/inventory/StockAdjustmentView";
import { ReportsView } from "@/components/reports/ReportsView";

type View = "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "fast-sale" | "stock-adjustment" | "reports";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("pos");

  const renderView = () => {
    switch (currentView) {
      case "pos":
        return <POSView />;
      case "products":
        return <ProductsView />;
      case "bulk-products":
        return <BulkProductsView />;
      case "import-csv":
        return <ImportCSVView />;
      case "fast-sale":
        return <FastSaleView />;
      case "stock-adjustment":
        return <StockAdjustmentView />;
      case "categories":
        return <CategoriesView />;
      case "sales":
        return <SalesView />;
      case "reports":
        return <ReportsView />;
      default:
        return <POSView />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-4">
          {renderView()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
