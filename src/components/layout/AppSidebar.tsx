// src/components/layout/AppSidebar.tsx

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Calculator, Package, FolderTree, BarChart3, Upload, Download, Zap, Settings, TrendingUp, Home, FileText, Receipt, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "stock-adjustment" | "reports" | "budgets" | "expenses";

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onCloseMobile?: () => void; // Nova prop para fechar no mobile
}

const menuItems = [
  {
    id: "dashboard" as View,
    title: "Dashboard",
    icon: Home,
  },
  {
    id: "pos" as View,
    title: "PDV",
    icon: Calculator,
  },
  {
    id: "budgets" as View,
    title: "Orçamentos",
    icon: FileText,
  },
  {
    id: "expenses" as View,
    title: "Despesas",
    icon: Receipt,
  },
  {
    id: "products" as View,
    title: "Produtos",
    icon: Package,
  },
  {
    id: "bulk-products" as View,
    title: "Cadastro em Lote",
    icon: Upload,
  },
  {
    id: "import-csv" as View,
    title: "Importar CSV",
    icon: Download,
  },
  {
    id: "stock-adjustment" as View,
    title: "Ajuste de Estoque",
    icon: Settings,
  },
  {
    id: "categories" as View,
    title: "Categorias",
    icon: FolderTree,
  },
  {
    id: "sales" as View,
    title: "Vendas",
    icon: BarChart3,
  },
  {
    id: "reports" as View,
    title: "Relatórios",
    icon: TrendingUp,
  },
];

export function AppSidebar({ currentView, onViewChange, onCloseMobile }: AppSidebarProps) {
  
  const handleItemClick = (view: View) => {
    onViewChange(view);
    // Fecha a sidebar no mobile após clicar em um item
    if (onCloseMobile && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Botão de fechar para mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sistema POS</h1>
            <p className="text-xs text-muted-foreground">Gestão de Vendas & Estoque</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseMobile}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar content */}
      <Sidebar static collapsible="icon" className="border-r flex-1"> 
        <SidebarContent className="flex-1">
          <SidebarGroup className="flex-1">
            <SidebarGroupContent className="pt-4 lg:pt-0">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleItemClick(item.id)}
                      isActive={currentView === item.id}
                      className="w-full justify-start"
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
