import React from 'react';
import { Product } from '../types';

interface WoodMarketplaceProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function WoodMarketplace({ products, onAddToCart }: WoodMarketplaceProps) {
  return (
    <section className="py-20">
      <h2 className="display-font text-5xl font-bold mb-16 italic">Vårt utvalg</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
          >
            <div className="mb-6 h-48 bg-gray-200 rounded-2xl overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E9B90] mb-3">
              {product.type}
            </span>
            <h3 className="text-2xl font-bold mb-4">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-8">{product.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold italic">{product.price},-</p>
              <button
                onClick={() => onAddToCart(product)}
                className="px-8 py-3 bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-wider hover:bg-opacity-90 transition-all"
              >
                Legg i kurv
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
