// app/[name]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { taggedQuery, parameterizedQuery } from "@/lib/db";
import { SiteWithRelations, EcommerceSite, Product } from "@/types";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Truck,
  Shield,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// Client Component for Category Filter and Price Filter
import FilterControls from "./FilterControls";
import MobileMenu from "./MobileMenu";

interface SitePageProps {
  params: Promise<{ name: string }>;
  searchParams?: Promise<{
    category?: string;
    page?: string;
    sort?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

async function getSiteBySlug(
  slug: string,
  category?: string,
  page: number = 1,
  searchQuery?: string,
  sort?: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<SiteWithRelations | null> {
  try {
    const sites = await taggedQuery<EcommerceSite>`
      SELECT * FROM ecommerce_sites WHERE slug = ${slug} LIMIT 1
    `;

    if (!sites?.length) return null;
    const site = sites[0];

    const categoriesResult = await parameterizedQuery<{ category: string }>(
      "SELECT DISTINCT category FROM products WHERE site_id = $1 AND category IS NOT NULL",
      [site.id],
    );

    // Use a fixed limit for server-side - we'll handle responsive grid with CSS
    const limit = 12; // Fixed limit, CSS will handle responsive grid
    const offset = (page - 1) * limit;

    let productsQuery = "SELECT * FROM products WHERE site_id = $1";
    const queryParams: any[] = [site.id];
    let paramIndex = 2;

    if (category) {
      productsQuery += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (searchQuery) {
      productsQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (minPrice !== undefined) {
      productsQuery += ` AND price >= $${paramIndex}`;
      queryParams.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      productsQuery += ` AND price <= $${paramIndex}`;
      queryParams.push(maxPrice);
      paramIndex++;
    }

    if (sort === "price_asc") {
      productsQuery += " ORDER BY price ASC";
    } else if (sort === "price_desc") {
      productsQuery += " ORDER BY price DESC";
    } else if (sort === "newest") {
      productsQuery += " ORDER BY created_at DESC";
    } else {
      productsQuery += " ORDER BY created_at DESC";
    }

    productsQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const products = await parameterizedQuery<Product>(
      productsQuery,
      queryParams,
    );

    let countQuery =
      "SELECT COUNT(*) as count FROM products WHERE site_id = $1";
    const countParams: any[] = [site.id];
    paramIndex = 2;

    if (category) {
      countQuery += ` AND category = $${paramIndex}`;
      countParams.push(category);
      paramIndex++;
    }

    if (searchQuery) {
      countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (minPrice !== undefined) {
      countQuery += ` AND price >= $${paramIndex}`;
      countParams.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      countQuery += ` AND price <= $${paramIndex}`;
      countParams.push(maxPrice);
    }

    const totalCount = await parameterizedQuery<{ count: number }>(
      countQuery,
      countParams,
    );
    const hasMore = offset + products.length < (totalCount[0]?.count || 0);

    return {
      ...site,
      products: products || [],
      customers: [],
      orders: [],
      categories: categoriesResult.map((c) => c.category).filter(Boolean),
      hasMore,
      currentPage: page,
      totalProducts: totalCount[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching site:", error);
    return null;
  }
}

export default async function SitePage({
  params,
  searchParams,
}: SitePageProps) {
  const { name } = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams?.category;
  const page = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page)
    : 1;
  const searchQuery = resolvedSearchParams?.q;
  const sort = resolvedSearchParams?.sort;
  const minPrice = resolvedSearchParams?.minPrice
    ? parseFloat(resolvedSearchParams.minPrice)
    : undefined;
  const maxPrice = resolvedSearchParams?.maxPrice
    ? parseFloat(resolvedSearchParams.maxPrice)
    : undefined;

  const site = await getSiteBySlug(
    name,
    category,
    page,
    searchQuery,
    sort,
    minPrice,
    maxPrice,
  );

  if (!site) notFound();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: site.currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const categories = site.categories || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <MobileMenu siteName={name} />

            {/* Logo - Smaller on mobile */}
            <Link
              href={`/${name}`}
              className="flex items-center gap-1.5 sm:gap-2 lg:gap-3"
            >
              {site.logo_url ? (
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden">
                  <Image
                    src={site.logo_url}
                    alt={site.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-sm sm:text-base lg:text-xl text-gray-900 truncate max-w-[120px] sm:max-w-none">
                {site.name}
              </span>
            </Link>

            {/* Search Bar - Hidden on mobile, visible on tablet/desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
              <form
                action={`/${name}`}
                method="GET"
                className="relative w-full"
              >
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
                {minPrice && (
                  <input type="hidden" name="minPrice" value={minPrice} />
                )}
                {maxPrice && (
                  <input type="hidden" name="maxPrice" value={maxPrice} />
                )}
                {sort && <input type="hidden" name="sort" value={sort} />}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery || ""}
                  placeholder="Search products..."
                  className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button type="submit" className="hidden">
                  Search
                </button>
              </form>
            </div>

            {/* User Actions - Compact on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button className="hidden sm:flex items-center gap-1 lg:gap-2 text-gray-700 hover:text-indigo-600">
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 p-3">
        <form action={`/${name}`} method="GET" className="relative w-full">
          {category && <input type="hidden" name="category" value={category} />}
          {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
          {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ""}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button type="submit" className="hidden">
            Search
          </button>
        </form>
      </div>

      {/* Hero Section - Simplified on mobile */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 lg:mb-4">
                Welcome to {site.name}
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-indigo-100 mb-4 lg:mb-8 max-w-2xl mx-auto lg:mx-0">
                {site.description ||
                  "Discover amazing products at great prices with fast shipping."}
              </p>
            </div>

            {/* Stats Grid - 2x2 on mobile, 4 on desktop */}
            <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full max-w-md lg:max-w-none">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 lg:p-6 text-white">
                <div className="text-lg sm:text-xl lg:text-3xl font-bold mb-0.5 lg:mb-2">
                  {site.totalProducts}+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-indigo-100">
                  Products
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 lg:p-6 text-white">
                <div className="text-lg sm:text-xl lg:text-3xl font-bold mb-0.5 lg:mb-2">
                  {categories.length}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-indigo-100">
                  Categories
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 lg:p-6 text-white">
                <div className="text-lg sm:text-xl lg:text-3xl font-bold mb-0.5 lg:mb-2">
                  24/7
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-indigo-100">
                  Support
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4 lg:p-6 text-white">
                <div className="text-lg sm:text-xl lg:text-3xl font-bold mb-0.5 lg:mb-2">
                  7dt
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-indigo-100">
                  Shipping
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info Bar - Scrollable on mobile */}
      {(site.phone || site.email || site.address) && (
        <div className="bg-white border-b border-gray-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center justify-between min-w-max lg:min-w-0 gap-4 lg:gap-0">
              <div className="flex items-center gap-4 lg:gap-6">
                {site.phone && (
                  <a
                    href={`tel:${site.phone}`}
                    className="flex items-center gap-1.5 lg:gap-2 text-gray-600 hover:text-indigo-600 text-xs lg:text-sm whitespace-nowrap"
                  >
                    <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>{site.phone}</span>
                  </a>
                )}
                {site.email && (
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-1.5 lg:gap-2 text-gray-600 hover:text-indigo-600 text-xs lg:text-sm whitespace-nowrap"
                  >
                    <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>{site.email}</span>
                  </a>
                )}
                {site.address && (
                  <div className="flex items-center gap-1.5 lg:gap-2 text-gray-600 text-xs lg:text-sm whitespace-nowrap">
                    <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="truncate max-w-[150px] lg:max-w-none">
                      {site.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Social Links - Always visible */}
              <div className="flex items-center gap-1 lg:gap-2">
                {site.instagram && (
                  <a
                    href={`https://instagram.com/${site.instagram}`}
                    className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Instagram className="w-3 h-3 lg:w-4 lg:h-4" />
                  </a>
                )}
                {site.facebook && (
                  <a
                    href={`https://facebook.com/${site.facebook}`}
                    className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Facebook className="w-3 h-3 lg:w-4 lg:h-4" />
                  </a>
                )}
                {site.twitter && (
                  <a
                    href={`https://twitter.com/${site.twitter}`}
                    className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Twitter className="w-3 h-3 lg:w-4 lg:h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Filters Section */}
        <div className="mb-6 sm:mb-8">
          <FilterControls
            categories={categories}
            currentCategory={category}
            searchQuery={searchQuery}
            siteName={name}
            minPrice={minPrice}
            maxPrice={maxPrice}
            currentSort={sort}
          />
        </div>

        {/* Products Grid - Responsive columns - CSS handles the responsive layout */}
        {site.products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {site.products.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg sm:hover:shadow-xl transition-all duration-300"
                >
                  {/* Product Image */}
                  <Link
                    href={`/${name}/product/${product.id}`}
                    className="block relative aspect-square bg-gray-100"
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-300" />
                      </div>
                    )}

                    {/* Sale Badge */}
                    {product.compareAtPrice && (
                      <span className="absolute top-1 sm:top-2 lg:top-3 left-1 sm:left-2 lg:left-3 px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded">
                        SALE
                      </span>
                    )}

                    {/* Category Tag - Hidden on mobile */}
                    {product.category && (
                      <span className="hidden sm:block absolute top-1 sm:top-2 lg:top-3 right-1 sm:right-2 lg:right-3 px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 bg-white/90 backdrop-blur rounded text-[10px] sm:text-xs font-medium text-gray-700">
                        {product.category}
                      </span>
                    )}

                    {/* Quick Actions - Simplified on mobile */}
                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 lg:p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1 sm:gap-2">
                        <button className="flex-1 bg-white text-gray-900 py-1 sm:py-1.5 lg:py-2 rounded text-[10px] sm:text-xs lg:text-sm font-medium hover:bg-indigo-600 hover:text-white transition-colors">
                          Quick View
                        </button>
                        <button className="p-1 sm:p-1.5 lg:p-2 bg-white rounded hover:bg-indigo-600 hover:text-white transition-colors">
                          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>

                  {/* Product Info - Compact on mobile */}
                  <div className="p-2 sm:p-3 lg:p-4">
                    <Link
                      href={`/${name}/product/${product.id}`}
                      className="block group-hover:text-indigo-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base mb-0.5 lg:mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description with fixed height and fade effect */}
                    {product.description && (
                      <div className="relative h-12 sm:h-14 lg:h-16 mb-2 lg:mb-3 overflow-hidden">
                        <p className="text-xs lg:text-sm text-gray-500">
                          {product.description}
                        </p>
                        {/* Fade overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">
                          <span>DT</span> {product.price}
                        </span>
                        {product.compareAtPrice && (
                          <span className="hidden sm:inline ml-1 lg:ml-2 text-xs lg:text-sm text-gray-400 line-through">
                            <span>DT</span>
                            {product.compareAtPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button - Compact on mobile */}
                    <button
                      className={`w-full mt-2 sm:mt-3 lg:mt-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-colors ${
                        product.stock > 0
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? "Add to Cart" : "Sold Out"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More - Responsive */}
            {site.hasMore && (
              <div className="mt-6 sm:mt-8 lg:mt-12 text-center">
                <Link
                  href={`/${name}?${new URLSearchParams({
                    ...(category && { category }),
                    ...(searchQuery && { q: searchQuery }),
                    ...(sort && { sort }),
                    ...(minPrice && { minPrice: minPrice.toString() }),
                    ...(maxPrice && { maxPrice: maxPrice.toString() }),
                    page: String((site.currentPage || 1) + 1),
                  })}`}
                  className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm lg:text-base text-gray-700 font-medium hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  Load More
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          // Empty State - Responsive
          <div className="text-center py-12 sm:py-16 lg:py-24 bg-white rounded-xl border border-gray-200">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
              {searchQuery ? "No products found" : "No products found"}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-500 mb-4 sm:mb-6">
              {searchQuery ? (
                <>
                  Try different keywords or{" "}
                  <Link
                    href={`/${name}`}
                    className="text-indigo-600 hover:underline"
                  >
                    view all
                  </Link>
                </>
              ) : (
                "Check back later for new arrivals"
              )}
            </p>
            <Link
              href={`/${name}`}
              className="inline-flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm lg:text-base hover:bg-indigo-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}
      </main>

      {/* Footer - Responsive */}
      <footer className="bg-gray-900 text-gray-300 mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-3 lg:mb-4">
                About {site.name}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base">
                Your premier destination for quality products at affordable
                prices.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-3 lg:mb-4">
                Customer Service
              </h3>
              <ul className="space-y-1.5 lg:space-y-2 text-xs sm:text-sm lg:text-base">
                <li>
                  <Link href={`/${name}#faq`} className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href={`/${name}#shipping`} className="hover:text-white">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href={`/${name}#returns`} className="hover:text-white">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href={`/${name}#privacy`} className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-3 lg:mb-4">
                Contact Info
              </h3>
              <ul className="space-y-1.5 lg:space-y-2 text-xs sm:text-sm lg:text-base">
                {site.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-3 h-3 lg:w-4 lg:h-4" /> {site.phone}
                  </li>
                )}
                {site.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-3 h-3 lg:w-4 lg:h-4" /> {site.email}
                  </li>
                )}
                {site.address && (
                  <li className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 lg:w-4 lg:h-4" /> {site.address}
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 lg:mt-12 pt-6 sm:pt-8 text-xs sm:text-sm text-center">
            <p>
              &copy; {new Date().getFullYear()} {site.name}. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
