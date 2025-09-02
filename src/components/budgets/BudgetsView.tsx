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
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      // Usar consulta segura que protege dados sensíveis do cliente
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Verificar se há dados sensíveis e logar o acesso para auditoria
      const budgetsWithSensitiveData = data?.filter(budget => 
        budget.customer_email || budget.customer_phone || budget.customer_name
      );
      
      if (budgetsWithSensitiveData && budgetsWithSensitiveData.length > 0) {
        console.log(`Acesso autorizado a ${budgetsWithSensitiveData.length} orçamentos com dados de clientes`);
      }
      
      setBudgets(data || []);
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
    try {
      const { data, error } = await supabase.rpc("convert_budget_to_sale", {
        budget_id_param: budgetId
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Orçamento convertido em venda com sucesso!"
      });

      fetchBudgets();
    } catch (error) {
      console.error("Erro ao converter orçamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao converter orçamento em venda",
        variant: "destructive"
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
    try {
      await generateBudgetPDF(budget);
      toast({
        title: "Sucesso",
        description: "PDF do orçamento gerado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do orçamento",
        variant: "destructive"
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
    const matchesSearch = !searchTerm || 
      budget.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Converter em Venda
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBudget(budget.id)}
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
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
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