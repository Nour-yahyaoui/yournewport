// app/[name]/loading.tsx
export default function SiteLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-64 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-indigo-600/50 via-purple-600/50 to-pink-500/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="w-48 h-8 bg-white/20 rounded-full animate-pulse" />
              <div className="w-96 h-12 bg-white/20 rounded-lg animate-pulse" />
              <div className="w-full h-20 bg-white/20 rounded-lg animate-pulse" />
            </div>
            <div className="w-56 h-56 bg-white/20 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-64 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}