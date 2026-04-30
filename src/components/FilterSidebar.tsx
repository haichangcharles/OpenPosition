import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { Filters, View, Source, PositionType, CollaboratorDomain } from '@/types';

interface FilterSidebarProps {
  activeView: View;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const SOURCE_OPTIONS: { value: Source; label: string; color: string }[] = [
  { value: 'LinkedIn', label: 'LinkedIn', color: '#0077B5' },
  { value: 'X', label: 'X (Twitter)', color: '#000000' },
  { value: 'RedBook', label: '小红书', color: '#FF2442' },
];

const POSITION_TYPE_OPTIONS: PositionType[] = [
  'PhD Student',
  'Research Intern',
  'PostDoc',
  'Research Assistant',
];

const COLLABORATOR_DOMAIN_OPTIONS: CollaboratorDomain[] = [
  'Long-term Research',
  'Short-term Project',
  'Co-author Needed',
];

export default function FilterSidebar({ activeView, filters, onFilterChange }: FilterSidebarProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !filters.keywords.includes(trimmed)) {
      onFilterChange({ ...filters, keywords: [...filters.keywords, trimmed] });
    }
  };

  const removeKeyword = (keyword: string) => {
    onFilterChange({ ...filters, keywords: filters.keywords.filter((k) => k !== keyword) });
  };

  const toggleSource = (source: Source) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source];
    onFilterChange({ ...filters, sources: newSources });
  };

  const togglePositionType = (type: PositionType) => {
    const newTypes = filters.positionTypes.includes(type)
      ? filters.positionTypes.filter((t) => t !== type)
      : [...filters.positionTypes, type];
    onFilterChange({ ...filters, positionTypes: newTypes });
  };

  const toggleCollaboratorDomain = (domain: CollaboratorDomain) => {
    const newDomains = filters.collaboratorDomains.includes(domain)
      ? filters.collaboratorDomains.filter((d) => d !== domain)
      : [...filters.collaboratorDomains, domain];
    onFilterChange({ ...filters, collaboratorDomains: newDomains });
  };

  return (
    <aside
      className="fixed top-[96px] left-0 w-[300px] h-[calc(100vh-96px)] bg-white overflow-y-auto"
      style={{ borderRight: '1px solid #DCDCDC' }}
    >
      <div className="p-5 space-y-6">
        {/* Keywords Filter */}
        <div>
          <h3 className="text-sm font-semibold text-[#333] mb-2">Keywords</h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#F0F0F0] text-[#555] rounded"
              >
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-[#781914]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addKeyword(keywordInput);
                setKeywordInput('');
              }
            }}
            placeholder="Add keyword..."
            className="w-full h-8 px-2.5 text-sm border border-[#DCDCDC] rounded outline-none focus:border-[#2C5F6F] transition-colors"
          />
        </div>

        {/* Source Filter */}
        <div>
          <h3 className="text-sm font-semibold text-[#333] mb-2">Source Platform</h3>
          <div className="space-y-2">
            {SOURCE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(opt.value)}
                  onChange={() => toggleSource(opt.value)}
                  className="w-4 h-4 accent-[#781914] cursor-pointer"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
                <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter - Positions */}
        {activeView === 'positions' && (
          <div>
            <h3 className="text-sm font-semibold text-[#333] mb-2">Position Type</h3>
            <div className="space-y-2">
              {POSITION_TYPE_OPTIONS.map((type) => (
                <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.positionTypes.includes(type)}
                    onChange={() => togglePositionType(type)}
                    className="w-4 h-4 accent-[#781914] cursor-pointer"
                  />
                  <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Domain Filter - Collaborators */}
        {activeView === 'collaborators' && (
          <div>
            <h3 className="text-sm font-semibold text-[#333] mb-2">Collaboration Domain</h3>
            <div className="space-y-2">
              {COLLABORATOR_DOMAIN_OPTIONS.map((domain) => (
                <label key={domain} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.collaboratorDomains.includes(domain)}
                    onChange={() => toggleCollaboratorDomain(domain)}
                    className="w-4 h-4 accent-[#781914] cursor-pointer"
                  />
                  <span className="text-sm text-[#555] group-hover:text-[#333] transition-colors">
                    {domain}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sort */}
        <div>
          <h3 className="text-sm font-semibold text-[#333] mb-2">Sort By</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'newest'}
                onChange={() => onFilterChange({ ...filters, sortBy: 'newest' })}
                className="w-4 h-4 accent-[#781914] cursor-pointer"
              />
              <span className="text-sm text-[#555]">Newest First</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'closingSoon'}
                onChange={() => onFilterChange({ ...filters, sortBy: 'closingSoon' })}
                className="w-4 h-4 accent-[#781914] cursor-pointer"
              />
              <span className="text-sm text-[#555]">Closing Soon</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
