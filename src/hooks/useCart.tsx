import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartUpdated = [...cart];

      const foundProductInCart = cartUpdated.find(
        (product) => product.id === productId
      );

      const stockProduct: Stock = await api
        .get(`/stock/${productId}`)
        .then((response) => response.data);
      const stockProductAmount = stockProduct.amount;

      const currentAmountProduct = foundProductInCart
        ? foundProductInCart.amount
        : 0;
      const amountProduct = currentAmountProduct + 1;

      if (amountProduct > stockProductAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (foundProductInCart) {
        foundProductInCart.amount++;
      } else {
        const product = await api
          .get(`/products/${productId}`)
          .then((response) => response.data);

        const newProduct = {
          ...product,
          amount: 1,
        };

        cartUpdated.push(newProduct);
      }

      setCart(cartUpdated);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdated));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartUpdated = [...cart];

      const foundProductInCart = cartUpdated.find(
        (product) => product.id === productId
      );

      if (foundProductInCart) {
        const index = cartUpdated.indexOf(foundProductInCart);
        if (index >= 0) {
          cartUpdated.splice(index, 1);
          setCart(cartUpdated);
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify(cartUpdated)
          );
        } else {
          throw Error();
        }
      }

      const currentAmountProduct = foundProductInCart
        ? foundProductInCart.amount
        : 0;

      const amountProduct = currentAmountProduct - 1;

      if (amountProduct <= 0) {
        toast.error('Erro na remoção do produto');
        return;
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
