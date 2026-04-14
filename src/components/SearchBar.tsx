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
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
        />
      </div>
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:bg-neutral-50 hover:text-primary-600 active:scale-95"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
