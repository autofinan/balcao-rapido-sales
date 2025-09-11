import { useCart } from "../context/CartContext";
import { X } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, clearCart } = useCart();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Carrinho</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-120px)]">
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Carrinho vazio</p>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} x R$ {item.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 text-sm"
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t">
        {cartItems.length > 0 && (
          <>
            <button
              onClick={clearCart}
              className="w-full bg-red-500 text-white py-2 rounded mb-2"
            >
              Limpar carrinho
            </button>
            <button
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Finalizar venda
            </button>
          </>
        )}
      </div>
    </div>
  );
}
