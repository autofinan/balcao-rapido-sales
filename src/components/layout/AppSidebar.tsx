// src/components/layout/AppSidebar.tsx

import { Calculator, Package, FolderTree, BarChart3, Upload, Download, Settings, TrendingUp, Home, FileText, Receipt, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "stock-adjustment" | "reports" | "budgets" | "expenses";

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onCloseMobile?: () => void;
}

const menuItems = [
  { id: "dashboard" as View, title: "Dashboard", icon: Home },
  { id: "pos" as View, title: "PDV", icon: Calculator },
  { id: "budgets" as View, title: "Orçamentos", icon: FileText },
  { id: "expenses" as View, title: "Despesas", icon: Receipt },
  { id: "products" as View, title: "Produtos", icon: Package },
  { id: "bulk-products" as View, title: "Cadastro em Lote", icon: Upload },
  { id: "import-csv" as View, title: "Importar CSV", icon: Download },
  { id: "stock-adjustment" as View, title: "Ajuste de Estoque", icon: Settings },
  { id: "categories" as View, title: "Categorias", icon: FolderTree },
  { id: "sales" as View, title: "Vendas", icon: BarChart3 },
  { id: "reports" as View, title: "Relatórios", icon: TrendingUp },
];

export function AppSidebar({ currentView, onViewChange, onCloseMobile }: AppSidebarProps) {
  
  const handleItemClick = (view: View) => {
    onViewChange(view);
  };

  return (
    <div className="h-full flex flex-col bg-background w-full">
      
      {/* Header da Sidebar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Sistema POS</h1>
            <p className="text-xs text-muted-foreground">Gestão & Vendas</p>
          </div>
        </div>
        
        {/* Botão fechar apenas no mobile */}
        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="h-8 w-8 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Menu Items - IMPORTANTE: Sem uso do componente Sidebar UI */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left hover:bg-accent hover:text-accent-foreground ${
                  currentView === item.id
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Sistema Online</span>
        </div>
      </div>
    </div>
  );
}
