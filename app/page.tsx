// app/page.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import CreateSiteForm from '@/components/CreateSiteForm';
import SiteDashboard from '@/components/SiteDashboard';
import { useEffect, useState } from 'react';
import { Store, LogOut, Plus } from 'lucide-react';
import { Site, Product, OrderWithProduct } from '@/types';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(true);
  const [showCreateSite, setShowCreateSite] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, isLoading, isSessionLoading, logout, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  // Fetch user's site when logged in
  useEffect(() => {
    if (user) {
      fetchUserSite();
    }
  }, [user]);

  const fetchUserSite = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const response = await fetch('/api/user/site', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please log in again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.site) {
        setSite(data.site);
        setProducts(data.products || []);
        setOrders(data.orders || []);
      } else {
        setSite(null);
        setProducts([]);
        setOrders([]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSite = async (formData: any) => {
    setLoading(true);
    setError('');
    
    try {
      if (!user) {
        throw new Error('You must be logged in');
      }
      
      console.log('Creating site for user:', user.id);
      console.log('Form data:', formData);
      
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || '',
          phone: formData.phone || '',
          email: formData.email || '',
          address: formData.address || '',
          currency: formData.currency || 'USD',
          instagram: formData.instagram || '',
          facebook: formData.facebook || '',
          twitter: formData.twitter || '',
          website: formData.website || '',
          founded_at: formData.founded_at || null,
          logo_url: formData.logo_url || '',
          userId: user.id
        }),
      });

      const data = await response.json();
      console.log('Create site response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create site');
      }

      await fetchUserSite();
      setShowCreateSite(false);
      
    } catch (error) {
      console.error('Error creating site:', error);
      setError(error instanceof Error ? error.message : 'Failed to create site');
    } finally {
      setLoading(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900">Seller Dashboard</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm sm:text-base text-gray-700"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>

          {/* Welcome Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Hello, {user.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-all">
                  User ID: <span className="font-mono text-xs">{user.id}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {site ? 'Manage your store' : 'Create your first store to get started'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-red-600 text-sm sm:text-base">
              Error: {error}
            </div>
          )}

          {/* Site Management */}
          {site ? (
            <SiteDashboard site={site} products={products} orders={orders} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 lg:p-12 text-center border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Store className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">You don't have a store yet</h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                Create your first e-commerce store to start selling products and managing orders.
              </p>
              {showCreateSite ? (
                <div className="max-w-2xl mx-auto">
                  <CreateSiteForm 
                    onSubmit={handleCreateSite}
                    onCancel={() => setShowCreateSite(false)}
                    isLoading={loading}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateSite(true)}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Your Store
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login/register form - already responsive
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <Store className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your e-commerce stores</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-3 sm:py-4 text-sm sm:text-base text-center font-medium transition-colors ${
                showLogin
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-3 sm:py-4 text-sm sm:text-base text-center font-medium transition-colors ${
                !showLogin
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {showLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}