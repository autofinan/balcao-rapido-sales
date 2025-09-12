import { Store, User, LogOut, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/context/CartContext"; 
import { Badge } from "@/components/ui/badge"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuToggle?: () => void;
  onCartToggle?: () => void; // NOVA PROP: para abrir o carrinho
}

export default function Header({ onMenuToggle, onCartToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { cartItems } = useCart();
  
  const totalItemsInCart = (cartItems || []).reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
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
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCartToggle} // ALTERADO: Agora usa a prop
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
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
