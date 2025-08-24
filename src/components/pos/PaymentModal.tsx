import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CartProduct } from "./POSView";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  cartItems: CartProduct[];
  onComplete: () => void;
}

type PaymentMethod = "pix" | "cartao" | "dinheiro";

export function PaymentModal({ open, onOpenChange, total, cartItems, onComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    { id: "pix" as PaymentMethod, label: "PIX", icon: Smartphone },
    { id: "cartao" as PaymentMethod, label: "Cartão", icon: CreditCard },
    { id: "dinheiro" as PaymentMethod, label: "Dinheiro", icon: Banknote },
  ];

  const handleConfirmSale = async () => {
    try {
      setLoading(true);

      // Registrar a venda
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          total: total,
          payment_method: paymentMethod,
          note: note || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Atualizar estoque dos produtos
      for (const item of cartItems) {
        // Primeiro, buscar o estoque atual
        const { data: productData, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (fetchError) throw fetchError;

        // Atualizar com o novo estoque
        const { error: updateError } = await supabase
          .from("products")
          .update({
            stock: Math.max(0, productData.stock - item.quantity)
          })
          .eq("id", item.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Venda finalizada",
        description: `Venda de R$ ${total.toFixed(2)} registrada com sucesso!`
      });

      onComplete();
      setNote("");
      setPaymentMethod("pix");
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar a venda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold">R$ {total.toFixed(2)}</h3>
            <p className="text-muted-foreground">{cartItems.length} itens</p>
          </div>

          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="text-center space-y-1">
                    <method.icon className="h-6 w-6 mx-auto" />
                    <p className="text-sm font-medium">{method.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observações (opcional)</Label>
            <Textarea
              id="note"
              placeholder="Adicione observações sobre a venda..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSale}
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar Venda"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}