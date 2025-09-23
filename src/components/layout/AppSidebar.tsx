import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Home,
  ShoppingCart,
  Package,
  FileText,
  DollarSign,
  BarChart3,
  Tags,
  Archive,
  Upload,
  PackagePlus,
  CreditCard,
  Receipt,
  FolderTree,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Início',
        url: '/',
        icon: Home,
      },
    ],
  },
  {
    title: 'Vendas',
    items: [
      {
        title: 'PDV',
        url: '/pdv',
        icon: CreditCard,
      },
      {
        title: 'Vendas',
        url: '/sales',
        icon: ShoppingCart,
      },
      {
        title: 'Orçamentos',
        url: '/budgets',
        icon: FileText,
      },
      {
        title: 'Despesas',
        url: '/expenses',
        icon: Receipt,
      },
    ],
  },
  {
    title: 'Produtos',
    items: [
      {
        title: 'Produtos',
        url: '/products',
        icon: Package,
      },
      {
        title: 'Cadastro em Lote',
        url: '/bulk-products',
        icon: PackagePlus,
      },
      {
        title: 'Importar CSV',
        url: '/import-csv',
        icon: Upload,
      },
      {
        title: 'Categorias',
        url: '/categories',
        icon: Tags,
      },
      {
        title: 'Ajuste de Estoque',
        url: '/stock-adjustment',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Estoque',
        url: '/stock',
        icon: Archive,
      },
      {
        title: 'Relatórios',
        url: '/reports',
        icon: BarChart3,
      },
      {
        title: 'Relatórios Avançados',
        url: '/advanced-reports',
        icon: TrendingUp,
      },
    ],
  },
];

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Função para navegação + fechar mobile
  function handleMenuClick(url: string) {
    navigate(url);
    if (onCloseMobile) onCloseMobile();
  }

  return (
    <Sidebar className="h-full flex flex-col bg-background w-full">
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

      {/* Conteúdo do menu */}
      <SidebarContent className="flex-1 overflow-y-auto p-3">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left hover:bg-accent hover:text-accent-foreground"
                        style={{
                          background:
                            location.pathname === item.url
                              ? 'var(--accent)'
                              : undefined,
                          color:
                            location.pathname === item.url
                              ? 'var(--accent-foreground)'
                              : undefined,
                          fontWeight:
                            location.pathname === item.url ? 500 : undefined,
                        }}
                        onClick={() => handleMenuClick(item.url)}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer/Status */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Sistema Online</span>
        </div>
      </div>
    </Sidebar>
  );
}
