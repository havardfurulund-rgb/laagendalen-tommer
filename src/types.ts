export interface Product {
  id: string;
  name: string;
  type: string;
  /** Pris inkl. mva (NOK) */
  price: number;
  description: string;
  imageUrl: string;
  volumeLiters: number;
  lengthCm: number;
  unitLabel: 'sekk' | 'storsekk';
  /** Pant i NOK; 0 for engangs småsekker, typisk 300 for storsekk */
  pant: number;
}

export interface CartItem extends Product {
  quantity: number;
}
