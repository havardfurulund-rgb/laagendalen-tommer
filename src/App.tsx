import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import WoodMarketplace from './components/WoodMarketplace';
import CartSidebar from './components/CartSidebar';
import AIAssistant from './components/AIAssistant';
import AIStudio from './components/AIStudio';
import DeliveryCalculator from './components/DeliveryCalculator';
import { INITIAL_PRODUCTS } from './constants';
import { Product, CartItem } from './types';

const App = () => {
  const [view, setView] = useState('home');
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={setView} currentView={view} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />
      <main className="flex-1">
        {view === 'home' && <Hero onCtaClick={() => setView('shop')} />}
        <div className="max-w-7xl mx-auto px-6">
          {view === 'shop' && <WoodMarketplace products={products} onAddToCart={addToCart} />}
          {view === 'delivery' && <DeliveryCalculator />}
          {view === 'studio' && <AIStudio />}
        </div>
      </main>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(c => c.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCart(c => c.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onClearCart={() => setCart([])} />
      <AIAssistant />
    </div>
  );
};
export default App;
