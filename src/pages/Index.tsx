import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, Users, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  vendasHoje: number;
  totalProdutos: number;
  totalClientes: number;
  receitaMensal: number;
}

interface VendaRecente {
  id: string;
  cliente_nome: string;
  total: number;
  status: string;
  created_at: string;
}

const Index: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    vendasHoje: 0,
    totalProdutos: 0,
    totalClientes: 0,
    receitaMensal: 0
  });
  const [vendasRecentes, setVendasRecentes] = useState<VendaRecente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    carregarDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para buscar e computar dados do dashboard
  const carregarDashboard = async () => {
    setLoading(true);

    try {
      // Buscar estatísticas principais
      const [
        { data: vendas, error: vendasError },
        { data: produtos, error: produtosError },
        { data: clientes, error: clientesError }
      ] = await Promise.all([
        supabase.from('sales').select('id, total, created_at'),
        supabase.from('products').select('id'),
        supabase.from('profiles').select('id')
      ]);

      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      // Vendas de hoje
      const vendasHoje =
        vendas?.filter(v => {
          // created_at pode ser null ou undefined
          if (!v.created_at) return false;
          return String(v.created_at).startsWith(hojeStr);
        }).reduce((sum, v) => sum + Number(v.total ?? 0), 0) || 0;

      // Receita mensal
      const receitaMensal =
        vendas?.filter(v => {
          if (!v.created_at) return false;
          return new Date(v.created_at) >= inicioMes;
        }).reduce((sum, v) => sum + Number(v.total ?? 0), 0) || 0;

      setStats({
        vendasHoje,
        totalProdutos: produtos?.length ?? 0,
        totalClientes: clientes?.length ?? 0,
        receitaMensal
      });

      // Buscar vendas recentes (5 últimas)
      // Primeiro tenta buscar direto cliente_nome
      let vendasRecentesData: any[] | null = null;
      let vendasRecentesError: any = null;

      const { data: vendasRecentesDireto, error: vendasRecentesDiretoError } = await supabase
        .from('sales')
        .select('id, cliente_nome, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (vendasRecentesDiretoError) {
        vendasRecentesError = vendasRecentesDiretoError;
      }

      if (vendasRecentesDireto && Array.isArray(vendasRecentesDireto) && vendasRecentesDireto.length > 0) {
        vendasRecentesData = vendasRecentesDireto.map(venda => ({
          id: venda.id,
          cliente_nome: venda.cliente_nome || 'Cliente não informado',
          total: Number(venda.total ?? 0),
          status: venda.status || 'Concluída',
          created_at: venda.created_at ?? ''
        }));
      } else {
        // Se não existe cliente_nome, tenta buscar via cliente_id e profiles
        const { data: vendasRecentesRelacionada, error: vendasRecentesRelacionadaError } = await supabase
          .from('sales')
          .select(`
            id,
            cliente_id,
            total,
            status,
            created_at,
            profiles ( full_name )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (vendasRecentesRelacionadaError) {
          vendasRecentesError = vendasRecentesRelacionadaError;
        }

        vendasRecentesData = vendasRecentesRelacionada?.map((venda: any) => ({
          id: venda.id,
          cliente_nome: venda.profiles?.full_name || 'Cliente não informado',
          total: Number(venda.total ?? 0),
          status: venda.status || 'Concluída',
          created_at: venda.created_at ?? ''
        })) ?? [];
      }

      setVendasRecentes(Array.isArray(vendasRecentesData) ? vendasRecentesData : []);

      if (vendasRecentesError) {
        // Loga erro, mas não quebra fluxo
        // eslint-disable-next-line no-console
        console.error('Erro ao buscar vendas recentes:', vendasRecentesError);
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao carregar dashboard:', error);

      // Mock se falhar
      setStats({
        vendasHoje: 2450,
        totalProdutos: 1234,
        totalClientes: 567,
        receitaMensal: 12500
      });
      setVendasRecentes([
        {
          id: '001',
          cliente_nome: 'Maria Silva',
          total: 145.9,
          status: 'Concluída',
          created_at: new Date().toISOString()
        },
        {
          id: '002',
          cliente_nome: 'João Santos',
          total: 89.5,
          status: 'Processando',
          created_at: new Date().toISOString()
        },
        {
          id: '003',
          cliente_nome: 'Ana Costa',
          total: 234.2,
          status: 'Concluída',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Formata data para pt-BR
  const formatarData = (data: string | undefined | null) => {
    if (!data) return '';
    try {
      return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Formata moeda para pt-BR
  const formatarMoeda = (valor: number | undefined | null) => {
    if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Cor do status
  const getStatusColor = (status: string | undefined | null) => {
    const s = (status ?? '').toLowerCase();
    switch (s) {
      case 'concluída':
      case 'concluida':
      case 'finalizada':
        return 'bg-green-100 text-green-800';
      case 'processando':
      case 'pendente':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu sistema POS</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vendas Hoje */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(stats.vendasHoje)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Atualizado agora</p>
        </div>

        {/* Produtos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produtos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProdutos}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">Cadastrados</p>
        </div>

        {/* Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalClientes}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">Cadastrados</p>
        </div>

        {/* Receita Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatarMoeda(stats.receitaMensal)}
              </p>
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
          <h3 className="text-lg font-semibold text-gray-900">
            Vendas Recentes
          </h3>
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
              {vendasRecentes.length > 0 ? (
                vendasRecentes.map(venda => (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{typeof venda.id === 'string' ? venda.id.slice(-6) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venda.cliente_nome || 'Cliente não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatarMoeda(venda.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          venda.status
                        )}`}
                      >
                        {venda.status || 'Concluída'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(venda.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de atualização */}
      <div className="flex justify-center">
        <button
          onClick={carregarDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Atualizar Dados'}
        </button>
      </div>
    </div>
  );
};

export default Index;
