// src/pages/Index.tsx - Usando o sidebar corrigido
import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Home, ShoppingCart, Package, Users, BarChart3, Settings } from 'lucide-react';

// Header Component
const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        {/* Trigger só aparece no mobile */}
        <SidebarTrigger className="lg:hidden" />
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Sistema POS</h1>
        </div>
      </div>
    </header>
  );
};

// Sidebar Content Component
const AppSidebarContent = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '#', active: true },
    { icon: ShoppingCart, label: 'Vendas', href: '#' },
    { icon: Package, label: 'Produtos', href: '#' },
    { icon: Users, label: 'Clientes', href: '#' },
    { icon: BarChart3, label: 'Relatórios', href: '#' },
    { icon: Settings, label: 'Configurações', href: '#' },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Sistema POS</span>
            <span className="text-xs text-gray-500">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </a>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">JS</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate">João Silva</span>
            <span className="text-xs text-gray-500 truncate">Administrador</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
};

// Main Content Component
const MainContent = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu sistema POS</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">R$ 2.450</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+12% desde ontem</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produtos</p>
              <p className="text-2xl font-bold text-gray-900">1.234</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">+3 novos hoje</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">567</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">+8 novos esta semana</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita</p>
              <p className="text-2xl font-bold text-gray-900">R$ 12.5K</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Este mês</p>
        </div>
      </div>

      {/* Tabela de vendas recentes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Maria Silva</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 145,90</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Concluída
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hoje, 14:30</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">João Santos</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 89,50</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Processando
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hoje, 13:15</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#003</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ana Costa</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 234,20</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Concluída
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hoje, 12:45</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Layout flex sem CSS variables problemáticas */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar - Desktop: sempre visível, Mobile: controlado por Sheet */}
        <Sidebar className="hidden lg:flex">
          <AppSidebarContent />
        </Sidebar>

        {/* Sidebar Mobile - Sheet automático */}
        <Sidebar className="lg:hidden">
          <AppSidebarContent />
        </Sidebar>

        {/* Área de conteúdo principal */}
        <SidebarInset>
          <Header />
          <main className="flex-1 overflow-auto">
            <MainContent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
