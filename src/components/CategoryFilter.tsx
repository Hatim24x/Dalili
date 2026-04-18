import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import { CATEGORIES } from '@/src/constants';

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
            "flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-bold transition-all shadow-sm",
            selectedCategory === cat.id
              ? "bg-primary-600 text-white shadow-primary-200"
              : "bg-white text-neutral-600 border border-neutral-100 hover:border-primary-200 hover:bg-primary-50"
          )}
        >
          <cat.icon className="h-3.5 w-3.5 md:h-4 w-4" />
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
