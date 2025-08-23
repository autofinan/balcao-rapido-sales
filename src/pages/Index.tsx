import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProductsView } from "@/components/products/ProductsView";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { SalesView } from "@/components/sales/SalesView";
import { POSView } from "@/components/pos/POSView";

type View = "pos" | "products" | "categories" | "sales";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("pos");

  const renderView = () => {
    switch (currentView) {
      case "pos":
        return <POSView />;
      case "products":
        return <ProductsView />;
      case "categories":
        return <CategoriesView />;
      case "sales":
        return <SalesView />;
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
