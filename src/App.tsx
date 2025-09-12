// src/App.tsx

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Header from "./components/layout/Header";
import { AppSidebar } from "./components/layout/AppSidebar";

// Importa o SidebarProvider
import { SidebarProvider } from "@/components/ui/sidebar";

// Páginas adicionais
import POSView from "./components/pos/POSView";
import ProductsPage from "./pages/Products";
import SalesPage from "./pages/Sales";
import BudgetsPage from "./pages/Budgets";
import ExpensesPage from "./pages/Expenses";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Estado para controlar view ativa
  const [currentView, setCurrentView] = useState<"dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "stock-adjustment" | "reports" | "budgets" | "expenses">("dashboard");

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
                <AppSidebar
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </aside>

              {/* Área principal */}
              <div className="flex-1 flex flex-col">
                <Header />

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/pos" element={<POSView />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
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
