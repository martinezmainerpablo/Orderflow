import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: { id: string; name: string; price: number; stock: number }) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        // Cargar carrito del localStorage al iniciar
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Guardar carrito en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: { id: string; name: string; price: number; stock: number }) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            
            if (existingItem) {
                // Si ya existe, incrementar cantidad (si hay stock)
                if (existingItem.quantity < product.stock) {
                    return prevCart.map(item =>
                        item.productId === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return prevCart; // No incrementar si no hay stock
            } else {
                // Agregar nuevo producto
                return [...prevCart, {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    stock: product.stock
                }];
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item => {
                if (item.productId === productId) {
                    // No permitir más que el stock disponible
                    const newQuantity = Math.min(quantity, item.stock);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalItems,
            getTotalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};