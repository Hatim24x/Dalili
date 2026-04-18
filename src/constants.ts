import { Utensils, Smartphone, Coffee, Shirt, ShoppingBag, Car, Scissors, HeartPulse } from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: ShoppingBag },
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Grocery', label: 'Grocery', icon: Coffee },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Automotive', label: 'Automotive', icon: Car },
  { id: 'Services', label: 'Services', icon: Scissors },
  { id: 'Health', label: 'Health', icon: HeartPulse },
];

export const APP_NAME = 'Qareeb';
export const DEFAULT_LOCATION = { lat: 31.8491, lng: 47.1456 }; // Maysan/Amarah
