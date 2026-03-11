// app/[name]/product/[productId]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { taggedQuery, parameterizedQuery } from '@/lib/db';
import { Product } from '@/types';
import { ArrowLeft, Star } from 'lucide-react';
import OrderButton from './OrderButton';

interface ProductPageProps {
  params: Promise<{ name: string; productId: string }>;
}

async function getProduct(siteSlug: string, productId: string): Promise<Product | null> {
  try {
    const site = await taggedQuery<{ id: string }>`
      SELECT id FROM ecommerce_sites WHERE slug = ${siteSlug} LIMIT 1
    `;

    if (!site?.length) return null;

    const products = await parameterizedQuery<Product>(
      'SELECT * FROM products WHERE id = $1 AND site_id = $2 LIMIT 1',
      [productId, site[0].id]
    );

    return products[0] || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { name, productId } = await params;
  const product = await getProduct(name, productId);

  if (!product) notFound();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Simple header for product page */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${name}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {name}</span>
          </Link>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative h-96 bg-gray-50 rounded-2xl overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-8xl opacity-30">📦</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.category && (
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium mb-4">
                  {product.category}
                </span>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-500">(24 customer reviews)</span>
              </div>

              {product.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
              )}

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </div>
                {product.stock > 0 ? (
                  <p className="text-green-600 text-sm mt-2">✓ In stock ({product.stock} available)</p>
                ) : (
                  <p className="text-red-600 text-sm mt-2">✕ Out of stock</p>
                )}
              </div>

              {/* Order Button Component */}
              <OrderButton
                siteName={name}
                productId={product.id}
                productName={product.name}
                price={product.price}
                stock={product.stock}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}