'use client';

import React, { useState, useRef, useEffect, useId, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { LANGUAGES, Language, getLanguage } from '@/lib/i18n/languages';

interface LanguageComboboxProps {
  className?: string;
  isScrolled?: boolean;
}

export function LanguageCombobox({ className = '', isScrolled = true }: LanguageComboboxProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const comboboxId = useId();
  const listboxId = `listbox-${comboboxId}`;

  const currentLang = getLanguage(currentLocale) || {
    code: currentLocale,
    nativeName: currentLocale.toUpperCase(),
    englishName: currentLocale.toUpperCase(),
    direction: 'ltr',
    status: 'human',
  };

  // Filter languages by query
  const filteredLanguages = React.useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return LANGUAGES.filter(
      (l) =>
        l.englishName.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Reset highlight when list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredLanguages.length]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectLanguage = (lang: Language) => {
    setIsOpen(false);
    if (lang.code === currentLocale) return;

    startTransition(() => {
      router.replace(pathname, { locale: lang.code });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredLanguages.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredLanguages.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredLanguages[highlightedIndex]) {
          handleSelectLanguage(filteredLanguages[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const activeElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const activeOptionId = isOpen && filteredLanguages[highlightedIndex]
    ? `opt-${comboboxId}-${filteredLanguages[highlightedIndex].code}`
    : undefined;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Combobox Trigger Button (min 44px touch target) */}
      <button
        type="button"
        id={comboboxId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-label={`Language selector. Current language: ${currentLang.englishName} (${currentLang.nativeName})`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className={[
          'min-h-[44px] px-3 py-2 border rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
          isScrolled
            ? 'border-border bg-offWhite text-ink hover:border-deepGreen focus-visible:ring-deepGreen'
            : 'border-wheat/40 bg-[#14281F]/[0.40] text-wheat hover:border-wheat focus-visible:ring-wheat',
          isPending ? 'opacity-60 cursor-wait' : 'cursor-pointer',
        ].join(' ')}
      >
        {/* Globe icon */}
        <svg
          className="w-4 h-4 shrink-0 text-deepGreen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>

        <span className="font-medium">
          {currentLang.nativeName}
        </span>
        <span className="opacity-70 text-[11px] uppercase">
          ({currentLang.code})
        </span>

        {/* Chevron icon */}
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-h-96 bg-offWhite border border-border rounded-[6px] shadow-none z-50 flex flex-col overflow-hidden"
          style={{ zIndex: 60 }}
        >
          {/* Search Input Filter */}
          <div className="p-2 border-b border-border bg-offWhite sticky top-0 z-10">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search 130+ languages..."
                aria-label="Filter languages by name or code"
                className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-offWhite border border-border rounded-[6px] text-xs font-sans text-ink placeholder:text-soilBrown focus:outline-none focus:border-deepGreen"
              />
              <svg
                className="w-4 h-4 text-soilBrown absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <div className="flex items-center justify-between text-[11px] text-soilBrown px-1 pt-1.5">
              <span>{filteredLanguages.length} available</span>
              <span>Use arrow keys to navigate</span>
            </div>
          </div>

          {/* Listbox */}
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Languages"
            className="overflow-y-auto flex-1 divide-y divide-border/50 py-1"
          >
            {filteredLanguages.length === 0 ? (
              <li className="p-4 text-center text-xs text-soilBrown">
                No language found matching &quot;{searchQuery}&quot;
              </li>
            ) : (
              filteredLanguages.map((lang, index) => {
                const isSelected = lang.code.toLowerCase() === currentLocale.toLowerCase();
                const isHighlighted = index === highlightedIndex;
                const optionId = `opt-${comboboxId}-${lang.code}`;

                return (
                  <li
                    key={lang.code}
                    id={optionId}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectLanguage(lang)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={[
                      'min-h-[44px] px-3 py-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors duration-100',
                      isHighlighted ? 'bg-[#E5ECE7] text-deepGreen' : 'text-ink',
                      isSelected ? 'font-bold' : 'font-normal',
                    ].join(' ')}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">
                        {lang.nativeName}
                      </span>
                      <span className="text-[11px] text-soilBrown">
                        {lang.englishName} ({lang.code})
                        {lang.direction === 'rtl' ? ' • RTL' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={[
                          'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-[4px] border',
                          lang.status === 'human'
                            ? 'bg-[#E5ECE7] text-deepGreen border-deepGreen/30'
                            : 'bg-offWhite text-soilBrown border-border',
                        ].join(' ')}
                      >
                        {lang.status === 'human' ? 'Verified' : 'Machine'}
                      </span>

                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-deepGreen shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
