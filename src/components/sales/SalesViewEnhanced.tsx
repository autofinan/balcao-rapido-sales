import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Search, BarChart2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportSalesToCSV } from "@/utils/exportUtils";
import { CancelSaleModal } from "./CancelSaleModal";

interface Sale {
  id: string;
  date: string;
  total: number;
  subtotal?: number;
  discount_type?: string;
  discount_value?: number;
  payment_method: string;
  note?: string;
  canceled: boolean;
  canceled_at?: string;
  cancel_reason?: string;
  total_revenue: number;
  total_profit: number;
  profit_margin_percentage: number;
}

export function SalesView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showCanceled, setShowCanceled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase.rpc('get_sales_with_profit');

      if (error) throw error;

      setSales(data || []);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = !searchTerm || 
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.note && sale.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    const matchesCanceled = showCanceled || !sale.canceled;
    
    return matchesSearch && matchesPayment && matchesCanceled;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.total_profit, 0);

  const handleExportCSV = async () => {
    try {
      const exportData = filteredSales.map(sale => ({
        id: sale.id,
        date: sale.date,
        total: sale.total,
        payment_method: sale.payment_method,
        note: sale.note || '',
        created_at: sale.date,
        total_profit: sale.total_profit,
        profit_margin: sale.profit_margin_percentage
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BarChart2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">Histórico e gestão de vendas</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4 items-center">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-canceled"
              checked={showCanceled}
              onCheckedChange={setShowCanceled}
            />
            <Label htmlFor="show-canceled">Mostrar canceladas</Label>
          </div>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Nenhuma venda encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Venda #{sale.id.slice(0, 8)}</p>
                      {sale.canceled && <Badge variant="destructive">Cancelada</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(sale.date).toLocaleDateString()}</span>
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      {sale.subtotal && sale.discount_value && sale.discount_value > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Subtotal: R$ {sale.subtotal.toFixed(2)}
                          <br />
                          Desconto: -{sale.discount_type === 'percentage' ? `${sale.discount_value}%` : `R$ ${sale.discount_value.toFixed(2)}`}
                        </div>
                      )}
                      <p className={`text-2xl font-bold ${sale.canceled ? 'line-through text-muted-foreground' : ''}`}>
                        R$ {sale.total.toFixed(2)}
                      </p>
                      {!sale.canceled && (
                        <p className="text-sm text-green-600">
                          Lucro: R$ {sale.total_profit.toFixed(2)} ({sale.profit_margin_percentage.toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sale.note && (
                    <p className="text-sm text-muted-foreground">{sale.note}</p>
                  )}
                  
                  {sale.canceled && sale.cancel_reason && (
                    <div className="p-2 bg-destructive/10 rounded text-sm">
                      <p className="font-medium text-destructive">Motivo do cancelamento:</p>
                      <p className="text-muted-foreground">{sale.cancel_reason}</p>
                      {sale.canceled_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cancelada em: {new Date(sale.canceled_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!sale.canceled && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          setCancelModalOpen(true);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSale && (
        <CancelSaleModal
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          saleId={selectedSale.id}
          saleTotal={selectedSale.total}
          onCancel={() => {
            setCancelModalOpen(false);
            setSelectedSale(null);
            fetchSales();
          }}
        />
      )}
    </div>
  );
}