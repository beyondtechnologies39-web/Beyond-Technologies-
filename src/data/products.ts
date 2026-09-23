import { Category, Product } from '../types';

import headphonesImg from '../assets/images/headphones_product_1790118724848.jpg';
import projectorImg from '../assets/images/projector_product_1790118734953.jpg';
import wirelessDockImg from '../assets/images/wireless_dock_product_1790118746259.jpg';
import ambientLampImg from '../assets/images/ambient_lamp_product_1790118756303.jpg';
import smartwatchImg from '../assets/images/smartwatch_product_1790118766353.jpg';
import soundbarImg from '../assets/images/soundbar_product_1790118794385.jpg';

export const CATEGORIES: Category[] = [
  { name: 'TV Appliances', icon: 'tv' },
  { name: 'Phone Accessories', icon: 'phone' },
  { name: 'Smart Home', icon: 'home' },
  { name: 'Personal Gadgets', icon: 'watch' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Auralite ANC Headphones',
    category: 'Personal Gadgets',
    description: 'Studio-grade quiet with 42 hours of wireless listening.',
    price: '129.99',
    rating: '4.8',
    reviews: 1240,
    badge: 'BESTSELLER',
    image: headphonesImg,
    featured: true,
    inventory: 38,
    createdAt: '2026-09-22T22:31:57.997Z',
    updatedAt: '2026-09-22T22:31:57.997Z',
  },
  {
    id: 2,
    name: 'Beam Mini Projector',
    category: 'TV Appliances',
    description: 'A pocket cinema with sharp 4K input and auto focus.',
    price: '159.99',
    rating: '4.7',
    reviews: 968,
    badge: 'TRENDING',
    image: projectorImg,
    featured: true,
    inventory: 17,
    createdAt: '2026-09-22T22:31:57.997Z',
    updatedAt: '2026-09-22T22:31:57.997Z',
  },
  {
    id: 3,
    name: 'MagDock 3-in-1 Station',
    category: 'Phone Accessories',
    description: 'One sculpted dock for phone, earbuds, and watch.',
    price: '49.99',
    rating: '4.6',
    reviews: 743,
    badge: 'POPULAR',
    image: wirelessDockImg,
    featured: true,
    inventory: 64,
    createdAt: '2026-09-22T22:31:57.997Z',
    updatedAt: '2026-09-22T22:31:57.997Z',
  },
  {
    id: 4,
    name: 'Halo Ambient Lamp',
    category: 'Smart Home',
    description: 'App-controlled light scenes tuned for work and rest.',
    price: '74.50',
    rating: '4.9',
    reviews: 516,
    badge: 'NEW',
    image: ambientLampImg,
    featured: false,
    inventory: 29,
    createdAt: '2026-09-22T22:31:57.997Z',
    updatedAt: '2026-09-22T22:31:57.997Z',
  },
  {
    id: 5,
    name: 'Pulse Active Watch',
    category: 'Personal Gadgets',
    description: 'A slim health companion with a seven-day battery.',
    price: '189.49',
    rating: '4.8',
    reviews: 892,
    badge: 'STAFF PICK',
    image: smartwatchImg,
    featured: false,
    inventory: 21,
    createdAt: '2026-09-22T22:31:57.997Z',
    updatedAt: '2026-09-22T22:31:57.997Z',
  },
  {
    id: 6,
    name: 'Arc Soundbar S2',
    category: 'TV Appliances',
    description: 'Room-filling dialogue and bass in one quiet silhouette.',
    price: '219.95',
    rating: '4.7',
    reviews: 407,
    badge: '20% OFF',
    image: soundbarImg,
    featured: false,
    inventory: 13,
    createdAt: '2026-09-22T22:31:57.997Z',
    updatedAt: '2026-09-22T22:31:57.997Z',
  },
];

export const formatCurrency = (val: string | number): string => {
  const num = Number(val);
  if (isNaN(num)) return 'UGX 0';
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(num);
};
