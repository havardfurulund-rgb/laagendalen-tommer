import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import WoodMarketplace from './components/WoodMarketplace';
import CartSidebar from './components/CartSidebar';
import AIAssistant from './components/AIAssistant';
import DeliveryCalculator from './components/DeliveryCalculator';
import Footer from './components/Footer';
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
        </div>
      </main>
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(c => c.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCart(c => c.flatMap(i => {
        if (i.id !== id) return [i];
        const quantity = i.quantity + d;
        return quantity > 0 ? [{ ...i, quantity }] : [];
      }))} onClearCart={() => setCart([])} />
      <AIAssistant />
    </div>
  );
};
export default App;
