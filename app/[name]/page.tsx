// app/[name]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { taggedQuery, parameterizedQuery } from '@/lib/db';
import { SiteWithRelations, EcommerceSite, Product } from '@/types';
import { Search, Grid3x3, Grid2x2, ArrowRight, Sparkles, Star, ChevronDown } from 'lucide-react';

interface SitePageProps {
  params: Promise<{ name: string }>;
  searchParams?: Promise<{ category?: string; page?: string }>;
}

async function getSiteBySlug(slug: string, category?: string, page: number = 1): Promise<SiteWithRelations | null> {
  try {
    const sites = await taggedQuery<EcommerceSite>`
      SELECT * FROM ecommerce_sites WHERE slug = ${slug} LIMIT 1
    `;

    if (!sites?.length) return null;
    const site = sites[0];

    // Get unique categories
    const categoriesResult = await parameterizedQuery<{ category: string }>(
      'SELECT DISTINCT category FROM products WHERE site_id = $1 AND category IS NOT NULL',
      [site.id]
    );

    const limit = 12;
    const offset = (page - 1) * limit;
    
    let productsQuery = 'SELECT * FROM products WHERE site_id = $1';
    const queryParams: any[] = [site.id];
    
    if (category) {
      productsQuery += ' AND category = $2';
      queryParams.push(category);
    }
    
    productsQuery += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);
    
    const products = await parameterizedQuery<Product>(productsQuery, queryParams);

    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE site_id = $1';
    const countParams: any[] = [site.id];
    
    if (category) {
      countQuery += ' AND category = $2';
      countParams.push(category);
    }
    
    const totalCount = await parameterizedQuery<{ count: number }>(countQuery, countParams);
    const hasMore = (offset + products.length) < (totalCount[0]?.count || 0);

    return { 
      ...site, 
      products: products || [], 
      customers: [],
      orders: [],
      categories: categoriesResult.map(c => c.category).filter(Boolean),
      hasMore,
      currentPage: page,
      totalProducts: totalCount[0]?.count || 0
    };
  } catch (error) {
    console.error('Error fetching site:', error);
    return null;
  }
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const { name } = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams?.category;
  const page = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) : 1;
  
  const site = await getSiteBySlug(name, category, page);

  if (!site) notFound();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: site.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const categories = site.categories || [];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <Link href={`/${name}`} className="flex items-center gap-3 group">
              {site.logo_url ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                  <Image
                    src={site.logo_url}
                    alt={site.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-white">
                    {site.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <span className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {site.name}
                </span>
                <p className="text-xs text-gray-500">Premium Store</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                <Sparkles className="w-4 h-4" />
                <span>Featured</span>
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <span className="text-xl">👤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Store Showcase */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Store Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Premium Quality Products</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {site.name}
              </h1>
              
              {site.description && (
                <p className="text-lg text-white/90 max-w-2xl mb-6">
                  {site.description}
                </p>
              )}

              {/* Store Stats */}
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{site.totalProducts}</div>
                  <div className="text-sm text-white/80">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{site.customers?.length || 128}+</div>
                  <div className="text-sm text-white/80">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{categories.length}</div>
                  <div className="text-sm text-white/80">Categories</div>
                </div>
              </div>
            </div>

            {/* Store Logo/Large Badge */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 md:w-56 md:h-56">
                <div className="absolute inset-0 bg-white/20 backdrop-blur rounded-3xl rotate-6"></div>
                <div className="absolute inset-0 bg-white/10 backdrop-blur rounded-3xl -rotate-3"></div>
                {site.logo_url ? (
                  <div className="relative w-full h-full rounded-3xl overflow-hidden ring-4 ring-white/30 shadow-2xl">
                    <Image
                      src={site.logo_url}
                      alt={site.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white/30 shadow-2xl flex items-center justify-center">
                    <span className="text-7xl font-bold text-white">
                      {site.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Store Info Bar */}
        {(site.phone || site.email || site.address) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-wrap gap-6 justify-between items-center">
              <div className="flex flex-wrap gap-6">
                {site.phone && (
                  <a href={`tel:${site.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors group">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Call us</div>
                      <div className="font-medium">{site.phone}</div>
                    </div>
                  </a>
                )}
                {site.email && (
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors group">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <span className="text-xl">✉️</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Email us</div>
                      <div className="font-medium">{site.email}</div>
                    </div>
                  </a>
                )}
                {site.address && (
                  <div className="flex items-center gap-3 text-gray-600 group">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Visit us</div>
                      <div className="font-medium">{site.address}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {site.instagram && (
                  <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all">
                    <span className="text-lg">📷</span>
                  </a>
                )}
                {site.facebook && (
                  <a href={`https://facebook.com/${site.facebook}`} target="_blank" rel="noopener noreferrer"
                     className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all">
                    <span className="text-lg font-bold">f</span>
                  </a>
                )}
                {site.twitter && (
                  <a href={`https://twitter.com/${site.twitter}`} target="_blank" rel="noopener noreferrer"
                     className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all">
                    <span className="text-lg">𝕏</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories & Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${name}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !category 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All Products
              </Link>
              {categories.map((cat, index) => (
                <Link
                  key={index}
                  href={`/${name}?category=${encodeURIComponent(cat)}`}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    category === cat 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {/* View Options */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{site.products.length}</span> of{' '}
              <span className="font-medium text-gray-900">{site.totalProducts}</span> products
            </p>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button className="p-2 bg-white rounded-lg shadow-sm">
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                  <Grid2x2 className="w-4 h-4" />
                </button>
              </div>
              
              <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {site.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {site.products.map((product) => (
                <div key={product.id} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                    {/* Product Image */}
                    <Link href={`/${name}/product/${product.id}`} className="block relative h-64 bg-gray-50">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-5xl opacity-30">📦</span>
                        </div>
                      )}
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 right-4">
                          <button className="w-full bg-white text-gray-900 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 hover:text-white transition-colors">
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Category Tag */}
                      {product.category && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                          {product.category}
                        </span>
                      )}

                      {/* Stock Badge */}
                      {product.stock > 0 ? (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                          In Stock
                        </span>
                      ) : (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                          Sold Out
                        </span>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-5">
                      <Link href={`/${name}/product/${product.id}`} className="block group-hover:text-indigo-600 transition-colors">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">(24 reviews)</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        
                        <Link
                          href={`/${name}/product/${product.id}`}
                          className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {site.hasMore && (
              <div className="mt-12 text-center">
                <Link
                  href={`/${name}?category=${category || ''}&page=${(site.currentPage || 1) + 1}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg transition-all group"
                >
                  <span>Load More Products</span>
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </Link>
                <p className="mt-3 text-sm text-gray-400">
                  Showing {site.products.length} of {site.totalProducts} products
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <div className="text-8xl mb-6 opacity-50">🛍️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products in this category</h3>
            <p className="text-gray-500 mb-8">Check back soon for new arrivals!</p>
            <Link
              href={`/${name}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}