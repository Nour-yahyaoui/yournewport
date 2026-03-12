// components/SiteDashboard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Package, ShoppingBag, Edit, Trash2, Plus, Eye, Loader2 } from 'lucide-react';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import EditOrderModal from './EditOrderModal';
import EditSiteModal from './EditSiteModal';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  product_name: string;
  quantity: number;
}

interface Site {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  website: string | null;
  founded_at: string | null;
}

interface SiteDashboardProps {
  site: Site;
  products: Product[];
  orders: Order[];
}

export default function SiteDashboard({ site, products, orders }: SiteDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [showEditSite, setShowEditSite] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState<string | null>(null);
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount).replace('TND', 'DT').replace(/\s/g, '');
  };

  const handleDeleteSite = async () => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sites/${site.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete site');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Failed to delete site');
      setIsDeleting(false);
    }
  };

  const handleProductAdded = () => {
    setShowAddProduct(false);
    router.refresh();
  };

  const handleProductUpdated = () => {
    setShowEditProduct(false);
    setSelectedProduct(null);
    router.refresh();
  };

  const handleOrderUpdated = () => {
    setShowEditOrder(false);
    setSelectedOrder(null);
    router.refresh();
  };

  const handleSiteUpdated = () => {
    setShowEditSite(false);
    router.refresh();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setIsDeletingProduct(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      router.refresh();
    } catch (error) {
      alert('Failed to delete product');
    } finally {
      setIsDeletingProduct(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Site Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {site.logo_url ? (
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image 
                  src={site.logo_url} 
                  alt={site.name} 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{site.name}</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">/{site.slug}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Link
              href={`/${site.slug}`}
              target="_blank"
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Store</span>
              <span className="sm:hidden">View</span>
            </Link>
            <button
              onClick={() => setShowEditSite(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Store"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleDeleteSite}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete Store"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-4 sm:gap-6 lg:gap-8 min-w-max sm:min-w-0 px-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-5 lg:mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Total Products</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Total Orders</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold text-purple-600">DT</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(orders.reduce((sum, o) => sum + o.total_amount, 0))}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Total Revenue</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0 gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{order.customer_name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{order.product_name} × {order.quantity}</p>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-2 sm:gap-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900">{formatCurrency(order.total_amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)} whitespace-nowrap`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-4 sm:py-6">No orders yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Products</h3>
              <button
                onClick={() => setShowAddProduct(true)}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {product.image_url && (
                      <div className="relative h-36 sm:h-40 bg-gray-50">
                        <Image 
                          src={product.image_url} 
                          alt={product.name} 
                          fill 
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">{product.name}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{product.stock} in stock</span>
                      </div>
                      {product.category && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-2">
                          {product.category}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm sm:text-base text-gray-900">{formatCurrency(product.price)}</span>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowEditProduct(true);
                            }}
                            className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isDeletingProduct === product.id}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Product"
                          >
                            {isDeletingProduct === product.id ? (
                              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 lg:p-12 text-center border border-gray-100">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">Add your first product to start selling</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          <div className="font-medium text-xs sm:text-sm text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.customer_phone}</div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm text-gray-900 line-clamp-1">{order.product_name}</div>
                          <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">{formatCurrency(order.total_amount)}</td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowEditOrder(true);
                            }}
                            className="p-1.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Update Order"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 lg:p-12 text-center">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                <p className="text-xs sm:text-sm text-gray-500">When customers place orders, they'll appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Store Settings</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
                  <p className="text-sm text-gray-900 break-words">{site.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                  <p className="text-sm text-gray-900">{site.currency}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900 break-words">{site.phone || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900 break-words">{site.email || 'Not set'}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-sm text-gray-900 break-words">{site.address || 'Not set'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditSite(true)}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Edit Store
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddProduct && (
        <AddProductModal
          siteId={site.id}
          onClose={() => setShowAddProduct(false)}
          onSuccess={handleProductAdded}
        />
      )}

      {showEditProduct && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEditProduct(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleProductUpdated}
        />
      )}

      {showEditOrder && selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowEditOrder(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleOrderUpdated}
        />
      )}

      {showEditSite && (
        <EditSiteModal
          site={site}
          onClose={() => setShowEditSite(false)}
          onSuccess={handleSiteUpdated}
        />
      )}
    </div>
  );
}