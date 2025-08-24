import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, Package, AlertTriangle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DayReport {
  totalSales: number;
  numberOfSales: number;
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStockProducts: {
    name: string;
    stock: number;
    min_stock: number;
  }[];
}

export function ReportsView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [report, setReport] = useState<DayReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateReport();
  }, [selectedDate]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      // Get sales for the selected date
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (salesError) throw salesError;

      // Get sale items with product details for the selected date
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products (
            name
          ),
          sales!inner (
            date
          )
        `)
        .gte('sales.date', startDate.toISOString())
        .lte('sales.date', endDate.toISOString());

      if (itemsError) throw itemsError;

      // Get products with low stock
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, stock, min_stock')
        .eq('is_active', true)
        .gte('min_stock', 1); // Only products with min_stock set

      if (productsError) throw productsError;

      // Calculate report data
      const totalSales = sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
      const numberOfSales = sales?.length || 0;

      // Calculate top products
      const productSales = new Map<string, { quantity: number; revenue: number }>();
      
      saleItems?.forEach(item => {
        const productName = item.products?.name || 'Produto removido';
        const existing = productSales.get(productName) || { quantity: 0, revenue: 0 };
        productSales.set(productName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total_price
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Calculate low stock products
      const lowStockProducts = products
        ?.filter(product => product.stock <= product.min_stock)
        .map(product => ({
          name: product.name,
          stock: product.stock,
          min_stock: product.min_stock
        }))
        .sort((a, b) => a.stock - b.stock) || [];

      setReport({
        totalSales,
        numberOfSales,
        topProducts,
        lowStockProducts
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    const csvContent = [
      `Relatório do Dia - ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`,
      '',
      'RESUMO GERAL',
      `Total Vendido,R$ ${report.totalSales.toFixed(2)}`,
      `Número de Vendas,${report.numberOfSales}`,
      '',
      'TOP 5 PRODUTOS MAIS VENDIDOS',
      'Produto,Quantidade,Receita',
      ...report.topProducts.map(p => `${p.name},${p.quantity},R$ ${p.revenue.toFixed(2)}`),
      '',
      'PRODUTOS COM ESTOQUE BAIXO',
      'Produto,Estoque Atual,Estoque Mínimo',
      ...report.lowStockProducts.map(p => `${p.name},${p.stock},${p.min_stock}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio-${format(selectedDate, "yyyy-MM-dd")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={exportToCSV} disabled={!report || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Gerando relatório...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {report?.totalSales.toFixed(2) || '0,00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report?.numberOfSales || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {report && report.numberOfSales > 0 
                    ? (report.totalSales / report.numberOfSales).toFixed(2) 
                    : '0,00'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {report?.lowStockProducts.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                {report?.topProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma venda registrada para esta data
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report?.topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.quantity}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            R$ {product.revenue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Produtos Abaixo do Mínimo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report?.lowStockProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    ✅ Todos os produtos estão com estoque adequado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Atual</TableHead>
                        <TableHead>Mínimo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report?.lowStockProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.stock === 0 ? "destructive" : "secondary"}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.min_stock}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}