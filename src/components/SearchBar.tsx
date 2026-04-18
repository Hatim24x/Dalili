import React from 'react';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
}

export default function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full rounded-2xl border border-neutral-200 bg-white py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
        />
      </div>
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:bg-neutral-50 hover:text-primary-600 active:scale-95 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      )}
    </div>
  );
}
