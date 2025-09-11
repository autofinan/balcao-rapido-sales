import { SidebarTrigger } from "@/components/ui/sidebar";
import { Store, User, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext"; // 👈 Adicionamos a importação do CartContext
import { Badge } from "@/components/ui/badge"; // 👈 Adicionamos a importação do Badge
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut } = useAuth();
  const { cartItems } = useCart(); // 👈 Obtemos os itens do carrinho
  
  // Calcula o total de itens no carrinho. A soma é baseada na quantidade de cada produto.
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

  // A função para abrir o carrinho será implementada no componente que usa o Header.
  // Por agora, vamos criar uma função de placeholder.
  const openCart = () => {
    // Lógica para abrir o drawer ou modal do carrinho.
    // Esta lógica deve ser implementada no componente pai, pois o Header
    // é um componente de apresentação (presentational component).
    console.log("Abrindo o carrinho...");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Sistema POS</h1>
              <p className="text-xs text-muted-foreground">Gestão de Vendas & Estoque</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          
          {/* 👈 Adicionamos o botão do carrinho */}
          <Button variant="ghost" size="icon" onClick={openCart} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {/* Se houver itens, mostra o badge */}
            {totalItemsInCart > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {totalItemsInCart}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block max-w-32 truncate">
                  {user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
