export interface Product {
  id: number;
  name: string;
  category: 'TV Appliances' | 'Phone Accessories' | 'Smart Home' | 'Personal Gadgets' | string;
  description: string;
  price: string;
  rating: string;
  reviews: number;
  badge: string;
  image: string;
  secondaryImage?: string;
  videoUrl?: string;
  featured: boolean;
  inventory: number;
  isDeal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  name: string;
  icon: 'tv' | 'phone' | 'home' | 'watch';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
