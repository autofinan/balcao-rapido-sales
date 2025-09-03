import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Eye, 
  Download, 
  CreditCard, 
  Banknote, 
  Smartphone,
  CheckCircle,
  X,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { exportSalesToCSV, ExportSale } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  date: string;
  total: number;
  subtotal?: number;
  discount_type?: string;
  discount_value?: number;
  payment_method: "pix" | "cartao" | "dinheiro" | "pending";
  note: string | null;
  created_at: string;
  total_profit?: number;
  profit_margin_percentage?: number;
  canceled?: boolean;
  cancel_reason?: string;
  canceled_at?: string;
  owner_id?: string;
}

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
}

const paymentMethodLabels = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  pending: "Pendente"
};

const paymentMethodIcons = {
  pix: Smartphone,
  cartao: CreditCard,
  dinheiro: Banknote,
  pending: RotateCcw
};

export function SalesViewEnhanced() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_sales_with_profit');

      if (error) throw error;
      
      setSales((data || []).map((sale: any) => ({
        ...sale,
        payment_method: sale.payment_method as "pix" | "cartao" | "dinheiro" | "pending"
      })));
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleItems = async (saleId: string) => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products (
            name
          )
        `)
        .eq("sale_id", saleId);

      if (error) throw error;
      
      setSaleItems((data || []).map((item: any) => ({
        ...item,
        product_name: item.products?.name || "Produto não encontrado"
      })));
    } catch (error) {
      console.error("Erro ao carregar itens da venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da venda",
        variant: "destructive"
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewDetails = async (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
    await fetchSaleItems(sale.id);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = !search || 
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      sale.note?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && !sale.canceled) ||
      (statusFilter === "canceled" && sale.canceled) ||
      (statusFilter === "converted" && sale.note?.includes("Convertido do orçamento"));
    
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (sale: Sale) => {
    if (sale.canceled) {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    if (sale.note?.includes("Convertido do orçamento")) {
      return <Badge variant="secondary">Orçamento Convertido</Badge>;
    }
    return <Badge variant="default">Concluída</Badge>;
  };

  const handleExportCSV = async () => {
    try {
      const exportData: ExportSale[] = filteredSales.map(sale => ({
        id: sale.id,
        date: sale.date,
        total: Number(sale.total),
        payment_method: sale.payment_method,
        note: sale.note,
        total_profit: sale.total_profit || 0,
        profit_margin: sale.profit_margin_percentage || 0,
        created_at: sale.created_at
      }));

      exportSalesToCSV(exportData);
      
      toast({
        title: "Exportação concluída",
        description: "Dados de vendas exportados com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.total_profit || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando vendas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">Gerencie e analise suas vendas</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold">{filteredSales.length}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lucro Total</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold">
              {formatCurrency(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por ID ou observações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="canceled">Canceladas</TabsTrigger>
            <TabsTrigger value="converted">Orçamentos Convertidos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os métodos</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhuma venda encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => {
            const PaymentIcon = paymentMethodIcons[sale.payment_method];
            
            return (
              <Card key={sale.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{sale.id.slice(-8)}
                        </span>
                        {getStatusBadge(sale)}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <PaymentIcon className="h-3 w-3" />
                          {paymentMethodLabels[sale.payment_method]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {sale.note && (
                        <p className="text-sm text-muted-foreground">
                          Obs: {sale.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(Number(sale.total))}</div>
                      {sale.total_profit !== undefined && (
                        <div className="text-sm">
                          <div className="text-green-600 font-medium">
                            Lucro: {formatCurrency(sale.total_profit)}
                          </div>
                          <div className="text-muted-foreground">
                            Margem: {(sale.profit_margin_percentage || 0).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(sale)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Sale Details Modal */}
      {showDetails && selectedSale && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Detalhes da Venda #{selectedSale.id.slice(-8)}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações da Venda</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span>{format(new Date(selectedSale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedSale)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pagamento:</span>
                      <span>{paymentMethodLabels[selectedSale.payment_method]}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Valores</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(Number(selectedSale.subtotal || selectedSale.total))}</span>
                    </div>
                    {selectedSale.discount_value && selectedSale.discount_value > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desconto:</span>
                        <span>
                          {selectedSale.discount_type === 'percentage' 
                            ? `${selectedSale.discount_value}%` 
                            : formatCurrency(selectedSale.discount_value)
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(Number(selectedSale.total))}</span>
                    </div>
                    {selectedSale.total_profit !== undefined && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Lucro:</span>
                          <span>{formatCurrency(selectedSale.total_profit)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Margem:</span>
                          <span>{(selectedSale.profit_margin_percentage || 0).toFixed(1)}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sale Items */}
              <div>
                <h4 className="font-medium mb-3">Itens da Venda</h4>
                {loadingItems ? (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground">Carregando itens...</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {saleItems.map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.total_price)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedSale.note && (
                <div>
                  <h4 className="font-medium mb-2">Observações</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedSale.note}
                  </p>
                </div>
              )}

              {/* Cancel Info */}
              {selectedSale.canceled && (
                <div>
                  <h4 className="font-medium mb-2">Informações do Cancelamento</h4>
                  <div className="text-sm space-y-1">
                    {selectedSale.canceled_at && (
                      <p>
                        <span className="text-muted-foreground">Data do cancelamento:</span>{" "}
                        {format(new Date(selectedSale.canceled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {selectedSale.cancel_reason && (
                      <p>
                        <span className="text-muted-foreground">Motivo:</span> {selectedSale.cancel_reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}