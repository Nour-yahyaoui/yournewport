// app/[name]/FilterControls.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Grid3x3, Grid2x2, X } from 'lucide-react';

interface FilterControlsProps {
  categories: string[];
  currentCategory?: string;
  searchQuery?: string;
  siteName: string;
  minPrice?: number;
  maxPrice?: number;
  currentSort?: string;
}

export default function FilterControls({ 
  categories, 
  currentCategory, 
  searchQuery, 
  siteName,
  minPrice,
  maxPrice,
  currentSort
}: FilterControlsProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState(minPrice?.toString() || '');
  const [priceMax, setPriceMax] = useState(maxPrice?.toString() || '');

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    const params = new URLSearchParams();
    
    if (category) {
      params.set('category', category);
    }
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (minPrice) {
      params.set('minPrice', minPrice.toString());
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice.toString());
    }
    
    if (currentSort) {
      params.set('sort', currentSort);
    }
    
    router.push(`/${siteName}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    const params = new URLSearchParams();
    
    if (currentCategory) {
      params.set('category', currentCategory);
    }
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (minPrice) {
      params.set('minPrice', minPrice.toString());
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice.toString());
    }
    
    if (sort) {
      params.set('sort', sort);
    }
    
    router.push(`/${siteName}?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams();
    
    if (currentCategory) {
      params.set('category', currentCategory);
    }
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (priceMin) {
      params.set('minPrice', priceMin);
    }
    
    if (priceMax) {
      params.set('maxPrice', priceMax);
    }
    
    if (currentSort) {
      params.set('sort', currentSort);
    }
    
    router.push(`/${siteName}?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    router.push(`/${siteName}?${params.toString()}`);
    setShowFilters(false);
  };

  const hasActiveFilters = !!(currentCategory || minPrice || maxPrice || currentSort);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>
          
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-md">
              <Grid2x2 className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            {searchQuery ? (
              <>Search results for "<span className="font-medium">{searchQuery}</span>"</>
            ) : (
              <>
                Showing products
              </>
            )}
          </p>
        </div>

        <select 
          value={currentSort || ''} 
          onChange={handleSortChange}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sort by: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  onChange={handleCategoryChange}
                  value={currentCategory || ''}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                onClick={applyPriceFilter}
                className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                    Category: {currentCategory}
                    <button onClick={() => {
                      const params = new URLSearchParams();
                      if (searchQuery) params.set('q', searchQuery);
                      if (minPrice) params.set('minPrice', minPrice.toString());
                      if (maxPrice) params.set('maxPrice', maxPrice.toString());
                      if (currentSort) params.set('sort', currentSort);
                      router.push(`/${siteName}?${params.toString()}`);
                    }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                    Price: {minPrice ? `$${minPrice}` : '$0'} - {maxPrice ? `$${maxPrice}` : 'Any'}
                    <button onClick={clearFilters}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}