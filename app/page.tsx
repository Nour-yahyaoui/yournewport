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
          'x-user-id': user.id // Use the actual logged-in user's ID
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
    
    // Send userId in the request body
    const response = await fetch('/api/sites', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id // Also send in headers for consistency
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
        userId: user.id // Send userId in body
      }),
    });

    const data = await response.json();
    console.log('Create site response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create site');
    }

    // Refresh the user site data
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Seller Dashboard</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Hello, {user.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-gray-500 mt-1">
                  User ID: <span className="font-mono text-xs">{user.id}</span>
                </p>
                <p className="text-gray-500 mt-1">
                  {site ? 'Manage your store' : 'Create your first store to get started'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
              Error: {error}
            </div>
          )}

          {/* Site Management */}
          {site ? (
            <SiteDashboard site={site} products={products} orders={orders} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You don't have a store yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Create your first e-commerce store to start selling products and managing orders.
              </p>
              {showCreateSite ? (
                <CreateSiteForm 
                  onSubmit={handleCreateSite}
                  onCancel={() => setShowCreateSite(false)}
                  isLoading={loading}
                />
              ) : (
                <button
                  onClick={() => setShowCreateSite(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your Store
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login/register form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your e-commerce stores</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                showLogin
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                !showLogin
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {showLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}