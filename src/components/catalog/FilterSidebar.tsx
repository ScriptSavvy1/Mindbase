"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedLevels: string[];
  priceType: string;
  onCategoryChange: (categories: string[]) => void;
  onLevelChange: (levels: string[]) => void;
  onPriceChange: (priceType: string) => void;
  onReset: () => void;
}

const categories = [
  { value: "ai", label: "Artificial Intelligence" },
  { value: "fintech", label: "Fintech Engineering" },
  { value: "other", label: "Blockchain & Web3" },
];

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const priceOptions = [
  { value: "", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function FilterSidebar({
  selectedCategories,
  selectedLevels,
  priceType,
  onCategoryChange,
  onLevelChange,
  onPriceChange,
  onReset,
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    level: true,
    price: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCategory = (value: string) => {
    if (selectedCategories.includes(value)) {
      onCategoryChange(selectedCategories.filter((c) => c !== value));
    } else {
      onCategoryChange([...selectedCategories, value]);
    }
  };

  const toggleLevel = (value: string) => {
    if (selectedLevels.includes(value)) {
      onLevelChange(selectedLevels.filter((l) => l !== value));
    } else {
      onLevelChange([...selectedLevels, value]);
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedLevels.length > 0 || priceType;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection
        title="Category"
        isOpen={openSections.category}
        onToggle={() => toggleSection("category")}
      >
        {categories.map((cat) => (
          <label
            key={cat.value}
            className="flex items-center gap-3 py-1.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat.value)}
              onChange={() => toggleCategory(cat.value)}
              className="w-4 h-4 rounded border-border bg-bg-input text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer accent-[#6c5ce7]"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              {cat.label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Skill Level */}
      <FilterSection
        title="Skill Level"
        isOpen={openSections.level}
        onToggle={() => toggleSection("level")}
      >
        {levels.map((lvl) => (
          <label
            key={lvl.value}
            className="flex items-center gap-3 py-1.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedLevels.includes(lvl.value)}
              onChange={() => toggleLevel(lvl.value)}
              className="w-4 h-4 rounded border-border bg-bg-input text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer accent-[#6c5ce7]"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              {lvl.label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection
        title="Price"
        isOpen={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        {priceOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 py-1.5 cursor-pointer group"
          >
            <input
              type="radio"
              name="price"
              checked={priceType === opt.value}
              onChange={() => onPriceChange(opt.value)}
              className="w-4 h-4 border-border bg-bg-input text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer accent-[#6c5ce7]"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </FilterSection>
    </aside>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && <div className="mt-3 space-y-1">{children}</div>}
    </div>
  );
}
