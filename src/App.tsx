// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import Header from "./components/layout/Header";
import { AppSidebar } from "./components/layout/AppSidebar";

// Produtos
import ProductsPage from "./components/products/ProductsView";
import BulkProductsPage from "./components/products/BulkProductsView";
import ImportCSVPage from "./components/products/ImportCSVView";

// PDV
import POSPage from "./components/pos/POSView";

// Orçamentos, despesas, vendas, relatórios, categorias, estoque
import BudgetsPage from "./components/budgets/BudgetsView";
import ExpensesPage from "./components/expenses/ExpensesDashboard";
import SalesPage from "./components/sales/SalesView";
import ReportsPage from "./components/reports/ReportsView";
import CategoriesPage from "./components/categories/CategoriesView";
import StockAdjustmentPage from "./components/inventory/StockAdjustmentView";

// Sidebar Provider
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <SidebarProvider>
          {user ? (
            <div className="flex h-screen">
              {/* Sidebar fixa */}
              <aside className="w-64 border-r bg-white">
                <AppSidebar currentView="dashboard" onViewChange={() => {}} />
              </aside>

              {/* Área principal */}
              <div className="flex-1 flex flex-col">
                <Header />

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/pos" element={<POSPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/bulk-products" element={<BulkProductsPage />} />
                    <Route path="/import-csv" element={<ImportCSVPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/stock-adjustment" element={<StockAdjustmentPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          )}
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
