// app/[name]/product/[productId]/ProductSkeleton.tsx
export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Product Image Skeleton */}
        <div className="relative h-96 bg-gray-200 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Category Tag Skeleton */}
          <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />

          {/* Title Skeleton */}
          <div className="space-y-3">
            <div className="w-3/4 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-1/2 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Price Skeleton */}
          <div className="space-y-2">
            <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-40 h-5 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Quantity Selector Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Order Button Skeleton */}
          <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse" />

          {/* Cash on Delivery Badge Skeleton */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}