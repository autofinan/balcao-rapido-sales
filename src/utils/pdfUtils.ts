import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface BudgetItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Budget {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  status: string;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
}

export const generateBudgetPDF = async (budget: Budget) => {
  try {
    // Validar acesso ao orçamento usando função de segurança
    const { data: isValid, error: validationError } = await supabase
      .rpc('validate_budget_owner', { budget_id_param: budget.id });
    
    if (validationError || !isValid) {
      throw new Error('Acesso negado: você não tem permissão para gerar PDF deste orçamento');
    }

    // Buscar itens do orçamento
    const { data: items, error } = await supabase
      .from('budget_items')
      .select(`
        id,
        quantity,
        unit_price,
        total_price,
        products!inner(name)
      `)
      .eq('budget_id', budget.id);

    if (error) throw error;

    const budgetItems: BudgetItem[] = (items || []).map(item => ({
      id: item.id,
      product_name: (item.products as any).name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    // Criar o PDF
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    
    // Informações da empresa (você pode personalizar)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sua Empresa Ltda', margin, yPosition);
    yPosition += 5;
    doc.text('Endereço da empresa', margin, yPosition);
    yPosition += 5;
    doc.text('Telefone: (00) 0000-0000', margin, yPosition);
    yPosition += 5;
    doc.text('E-mail: contato@empresa.com', margin, yPosition);
    
    yPosition += 20;
    
    // Informações do orçamento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO ORÇAMENTO', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Número: ${budget.id.substring(0, 8)}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Data: ${new Date(budget.created_at).toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 5;
    
    if (budget.valid_until) {
      doc.text(`Válido até: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 5;
    }
    
    yPosition += 10;
    
    // Dados do cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (budget.customer_name) {
      doc.text(`Nome: ${budget.customer_name}`, margin, yPosition);
      yPosition += 5;
    }
    if (budget.customer_email) {
      doc.text(`E-mail: ${budget.customer_email}`, margin, yPosition);
      yPosition += 5;
    }
    if (budget.customer_phone) {
      doc.text(`Telefone: ${budget.customer_phone}`, margin, yPosition);
      yPosition += 5;
    }
    
    yPosition += 15;
    
    // Tabela de itens
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DO ORÇAMENTO', margin, yPosition);
    yPosition += 10;
    
    // Cabeçalho da tabela
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const tableHeaders = ['Item', 'Qtd', 'Valor Unit.', 'Total'];
    const colWidths = [90, 20, 30, 30];
    let xPosition = margin;
    
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 5;
    
    // Linha separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    // Itens da tabela
    doc.setFont('helvetica', 'normal');
    budgetItems.forEach(item => {
      xPosition = margin;
      
      // Quebrar texto longo do produto
      const productLines = doc.splitTextToSize(item.product_name, colWidths[0] - 5);
      doc.text(productLines, xPosition, yPosition);
      
      xPosition += colWidths[0];
      doc.text(item.quantity.toString(), xPosition, yPosition);
      
      xPosition += colWidths[1];
      doc.text(`R$ ${item.unit_price.toFixed(2)}`, xPosition, yPosition);
      
      xPosition += colWidths[2];
      doc.text(`R$ ${item.total_price.toFixed(2)}`, xPosition, yPosition);
      
      yPosition += Math.max(5, (productLines.length - 1) * 4 + 5);
    });
    
    yPosition += 10;
    
    // Totais
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'bold');
    const totalsX = pageWidth - margin - 60;
    
    doc.text(`Subtotal: R$ ${budget.subtotal.toFixed(2)}`, totalsX, yPosition);
    yPosition += 7;
    
    if (budget.discount_value > 0) {
      const discountText = budget.discount_type === 'percentage' 
        ? `Desconto (${budget.discount_value}%): R$ ${(budget.subtotal * budget.discount_value / 100).toFixed(2)}`
        : `Desconto: R$ ${budget.discount_value.toFixed(2)}`;
      doc.text(discountText, totalsX, yPosition);
      yPosition += 7;
    }
    
    doc.setFontSize(12);
    doc.text(`TOTAL: R$ ${budget.total.toFixed(2)}`, totalsX, yPosition);
    
    // Observações
    if (budget.notes) {
      yPosition += 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', margin, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, yPosition);
    }
    
    // Baixar o PDF
    const fileName = `orcamento-${budget.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};