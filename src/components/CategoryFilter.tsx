import React from 'react';
import { useTranslation } from 'react-i18next';
import { Coffee, Smartphone, ShoppingBag, Utensils, Shirt } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ShoppingBag },
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Grocery', label: 'Grocery', icon: Coffee },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold transition-all shadow-sm",
            selectedCategory === cat.id
              ? "bg-primary-600 text-white shadow-primary-200"
              : "bg-white text-neutral-600 border border-neutral-100 hover:border-primary-200 hover:bg-primary-50"
          )}
        >
          <cat.icon className="h-4 w-4" />
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
