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
    let yPosition = 25;
    
    // Header com fundo colorido
    doc.setFillColor(59, 130, 246); // bg-blue-500
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Cabeçalho
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // texto branco
    doc.text('ORÇAMENTO', pageWidth / 2, 22, { align: 'center' });
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
    yPosition = 50;
    
    // Box para informações da empresa
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252); // bg-slate-50
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'FD');
    
    // Informações da empresa
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUA EMPRESA LTDA', margin + 5, yPosition);
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Endereço da empresa', margin + 5, yPosition);
    yPosition += 4;
    doc.text('Telefone: (00) 0000-0000 | E-mail: contato@empresa.com', margin + 5, yPosition);
    
    yPosition += 25;
    
    // Box para dados do orçamento
    doc.setFillColor(254, 249, 195); // bg-yellow-100
    doc.rect(margin, yPosition, (pageWidth - 2 * margin) / 2 - 5, 35, 'FD');
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO ORÇAMENTO', margin + 5, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Número: #${budget.id.substring(0, 8).toUpperCase()}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Data de Emissão: ${new Date(budget.created_at).toLocaleDateString('pt-BR')}`, margin + 5, yPosition);
    yPosition += 5;
    
    if (budget.valid_until) {
      doc.text(`Válido até: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`, margin + 5, yPosition);
    }
    
    // Status do orçamento (do lado direito)
    const statusX = margin + (pageWidth - 2 * margin) / 2 + 5;
    yPosition -= 18;
    
    doc.setFillColor(220, 252, 231); // bg-green-100
    doc.rect(statusX, yPosition, (pageWidth - 2 * margin) / 2 - 5, 35, 'FD');
    
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS', statusX + 5, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    const statusText = budget.status === 'open' ? 'ABERTO' : 
                      budget.status === 'converted' ? 'CONVERTIDO' : 'CANCELADO';
    doc.text(`Status: ${statusText}`, statusX + 5, yPosition);
    
    yPosition += 25;
    
    // Box para dados do cliente
    doc.setFillColor(239, 246, 255); // bg-blue-50
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'FD');
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', margin + 5, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (budget.customer_name) {
      doc.text(`Nome: ${budget.customer_name}`, margin + 5, yPosition);
      yPosition += 5;
    } else {
      doc.text('Nome: Cliente não informado', margin + 5, yPosition);
      yPosition += 5;
    }
    
    if (budget.customer_email) {
      doc.text(`E-mail: ${budget.customer_email}`, margin + 5, yPosition);
      yPosition += 5;
    }
    
    if (budget.customer_phone) {
      doc.text(`Telefone: ${budget.customer_phone}`, margin + 5, yPosition);
      yPosition += 5;
    }
    
    yPosition += 20;
    
    // Seção de itens
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DO ORÇAMENTO', margin, yPosition);
    yPosition += 12;
    
    // Cabeçalho da tabela com fundo
    doc.setFillColor(75, 85, 99); // bg-gray-600
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // texto branco
    
    const tableHeaders = ['PRODUTO', 'QTD', 'VALOR UNIT.', 'TOTAL'];
    const colWidths = [85, 25, 35, 35];
    let xPosition = margin + 2;
    
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPosition, yPosition + 5);
      xPosition += colWidths[index];
    });
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
    
    // Itens da tabela
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    budgetItems.forEach((item, index) => {
      // Fundo alternado para as linhas
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // bg-gray-50
        doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
      }
      
      xPosition = margin + 2;
      
      // Quebrar texto longo do produto
      const productLines = doc.splitTextToSize(item.product_name, colWidths[0] - 5);
      doc.text(productLines, xPosition, yPosition + 3);
      
      xPosition += colWidths[0];
      doc.text(item.quantity.toString(), xPosition, yPosition + 3, { align: 'center' });
      
      xPosition += colWidths[1];
      doc.text(`R$ ${item.unit_price.toFixed(2)}`, xPosition, yPosition + 3, { align: 'right' });
      
      xPosition += colWidths[2];
      doc.text(`R$ ${item.total_price.toFixed(2)}`, xPosition, yPosition + 3, { align: 'right' });
      
      yPosition += Math.max(8, (productLines.length - 1) * 4 + 8);
    });
    
    yPosition += 15;
    
    // Box para totais
    const totalsBoxHeight = budget.discount_value > 0 ? 35 : 25;
    doc.setFillColor(254, 242, 242); // bg-red-50
    doc.setDrawColor(239, 68, 68); // border-red-500
    doc.rect(pageWidth - margin - 80, yPosition, 75, totalsBoxHeight, 'FD');
    
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const totalsX = pageWidth - margin - 75;
    
    doc.text(`Subtotal:`, totalsX, yPosition);
    doc.text(`R$ ${budget.subtotal.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
    yPosition += 6;
    
    if (budget.discount_value > 0) {
      const discountAmount = budget.discount_type === 'percentage' 
        ? (budget.subtotal * budget.discount_value / 100)
        : budget.discount_value;
      
      doc.text(`Desconto:`, totalsX, yPosition);
      doc.text(`-R$ ${discountAmount.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 6;
    }
    
    // Linha separadora
    doc.setDrawColor(239, 68, 68);
    doc.line(totalsX, yPosition, pageWidth - margin - 5, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL:`, totalsX, yPosition);
    doc.text(`R$ ${budget.total.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
    
    // Observações
    if (budget.notes) {
      yPosition += 25;
      
      doc.setFillColor(255, 247, 237); // bg-orange-50
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'FD');
      
      yPosition += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', margin + 5, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 2 * margin - 10);
      doc.text(notesLines, margin + 5, yPosition);
    }
    
    // Rodapé
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Este orçamento foi gerado automaticamente pelo sistema.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Baixar o PDF
    const customerName = budget.customer_name ? budget.customer_name.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente';
    const fileName = `Orcamento_${customerName}_${budget.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};