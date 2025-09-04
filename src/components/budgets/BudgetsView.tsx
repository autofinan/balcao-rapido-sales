import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, FileText, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BudgetForm } from "./BudgetForm";
import { BudgetDetails } from "./BudgetDetails";
import { generateBudgetPDF } from "@/utils/pdfUtils";

interface Budget {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  status: 'open' | 'converted' | 'canceled';
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  converted_sale_id: string | null;
}

export function BudgetsView() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [convertingBudgets, setConvertingBudgets] = useState<Set<string>>(new Set());
  const [generatingPdfs, setGeneratingPdfs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      // SEGURANÇA: Buscar dados dos orçamentos sem informações sensíveis do cliente
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          id,
          subtotal,
          discount_type,
          discount_value,
          total,
          status,
          notes,
          valid_until,
          created_at,
          updated_at,
          converted_sale_id,
          canceled_at,
          cancel_reason,
          canceled_by,
          owner_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Buscar informações protegidas do cliente para cada orçamento
      const budgetsWithCustomerData: Budget[] = await Promise.all(
        (data || []).map(async (budget): Promise<Budget> => {
          const { data: protectedData, error: protectedError } = await supabase
            .rpc('get_budget_with_protected_customer_data', { budget_id_param: budget.id });
          
          if (protectedError) {
            console.error(`Erro ao buscar dados protegidos do orçamento ${budget.id}:`, protectedError);
            // Retornar dados básicos sem informações do cliente em caso de erro
            return {
              ...budget,
              customer_name: null,
              customer_email: null,
              customer_phone: null,
            } as Budget;
          }
          
          const customerData = protectedData?.[0];
          return {
            ...budget,
            customer_name: customerData?.customer_name || null,
            customer_email: customerData?.customer_email || null,
            customer_phone: customerData?.customer_phone || null,
          } as Budget;
        })
      );
      
      // Log de auditoria: registrar acesso aos dados usando função segura
      console.log(`Acesso seguro a ${budgetsWithCustomerData.length} orçamentos via função protegida`);
      
      setBudgets(budgetsWithCustomerData);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar orçamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToSale = async (budgetId: string) => {
    setConvertingBudgets(prev => new Set(prev).add(budgetId));
    
    try {
      console.log('🔄 Iniciando conversão de orçamento para venda:', budgetId);
      
      const { data, error } = await supabase.rpc("convert_budget_to_sale", {
        budget_id_param: budgetId
      });

      if (error) {
        console.error('❌ Erro RPC:', error);
        throw error;
      }

      console.log('✅ Venda criada com ID:', data);
      
      toast({
        title: "✅ Sucesso!",
        description: "Orçamento convertido em venda com sucesso! A venda foi criada e o orçamento marcado como convertido.",
      });

      fetchBudgets();
    } catch (error) {
      console.error("❌ Erro completo ao converter orçamento:", error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao converter orçamento em venda",
        variant: "destructive"
      });
    } finally {
      setConvertingBudgets(prev => {
        const newSet = new Set(prev);
        newSet.delete(budgetId);
        return newSet;
      });
    }
  };

  const handleCancelBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          cancel_reason: "Cancelado pelo usuário"
        })
        .eq("id", budgetId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Orçamento cancelado com sucesso!"
      });

      fetchBudgets();
    } catch (error) {
      console.error("Erro ao cancelar orçamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar orçamento",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async (budget: Budget) => {
    setGeneratingPdfs(prev => new Set(prev).add(budget.id));
    
    try {
      console.log("Iniciando geração de PDF para orçamento:", budget.id);
      const result = await generateBudgetPDF(budget);
      
      if (result !== false) {
        toast({
          title: "📄 PDF Gerado!",
          description: "PDF do orçamento baixado com sucesso! Verifique sua pasta de downloads.",
        });
      } else {
        throw new Error("Falha na geração do PDF");
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar PDF do orçamento",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdfs(prev => {
        const newSet = new Set(prev);
        newSet.delete(budget.id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">Aberto</Badge>;
      case "converted":
        return <Badge variant="secondary">Convertido</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    // SEGURANÇA: Busca apenas se dados não estão protegidos/mascarados
    const matchesSearch = !searchTerm || 
      (budget.customer_name && 
       budget.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (budget.customer_email && 
       budget.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando orçamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos e converta em vendas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="converted">Convertidos</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredBudgets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredBudgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {budget.customer_name || "Cliente não informado"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(budget.created_at).toLocaleDateString()}</span>
                      {getStatusBadge(budget.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ {budget.total.toFixed(2)}</div>
                    {budget.discount_value > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Desc: {budget.discount_type === 'percentage' ? `${budget.discount_value}%` : `R$ ${budget.discount_value.toFixed(2)}`}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBudget(budget);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  
                  {budget.status === "open" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvertToSale(budget.id)}
                        disabled={convertingBudgets.has(budget.id)}
                      >
                        {convertingBudgets.has(budget.id) ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-1 rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            Convertendo...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Converter em Venda
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBudget(budget.id)}
                        disabled={convertingBudgets.has(budget.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGeneratePDF(budget)}
                    disabled={generatingPdfs.has(budget.id)}
                  >
                    {generatingPdfs.has(budget.id) ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-1 rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showForm && (
        <BudgetForm
          open={showForm}
          onOpenChange={setShowForm}
          onSave={() => {
            setShowForm(false);
            fetchBudgets();
          }}
        />
      )}

      {showDetails && selectedBudget && (
        <BudgetDetails
          budget={selectedBudget}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}
    </div>
  );
}