import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Calculator, Package, FolderTree, BarChart3, Upload, Download, Zap, Settings, TrendingUp, Home, FileText, Receipt } from "lucide-react";

type View = "dashboard" | "pos" | "products" | "categories" | "sales" | "bulk-products" | "import-csv" | "fast-sale" | "stock-adjustment" | "reports" | "budgets" | "expenses";

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
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
    id: "fast-sale" as View,
    title: "Venda Rápida",
    icon: Zap,
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

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
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
  );
}