// components/CreateSiteForm.tsx
'use client';

import { useState } from 'react';
import { Loader2, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface CreateSiteFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CreateSiteForm({ onSubmit, onCancel, isLoading }: CreateSiteFormProps) {
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    currency: 'USD',
    instagram: '',
    facebook: '',
    twitter: '',
    website: '',
    founded_at: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 32 * 1024 * 1024) {
      setError('File size must be less than 32MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setLogoFile(file);
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploadingLogo(true);
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: new URLSearchParams({
          key: process.env.NEXT_PUBLIC_IMGBB_API_KEY || '',
          image: await fileToBase64(file)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.data.url;
    } catch (error) {
      console.error('ImgBB upload error:', error);
      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await uploadToImgBB(logoFile);
      }

      await onSubmit({
        ...formData,
        logo_url: logoUrl
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const isSubmitting = isLoading || uploadingLogo;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6 text-left">
      {error && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Logo Upload */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Store Logo
        </label>
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex-shrink-0">
            {logoPreview ? (
              <>
                <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview('');
                  }}
                  className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-500">
              Upload your store logo. Recommended size: 200x200px.
              <br className="hidden sm:block" />
              <span className="text-xs">Max file size: 32MB</span>
            </p>
          </div>
        </div>
      </div>

      {/* Store Name */}
      <div>
        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Store Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Store Slug */}
      <div>
        <label htmlFor="slug" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Store URL
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm text-gray-500">yoursite.com/</span>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            readOnly
            className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Auto-generated from store name</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Store Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({...formData, currency: e.target.value})}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            disabled={isSubmitting}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="TND">TND (DT)</option>
          </select>
        </div>

        <div>
          <label htmlFor="founded_at" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Founded Date
          </label>
          <input
            type="date"
            id="founded_at"
            value={formData.founded_at}
            onChange={(e) => setFormData({...formData, founded_at: e.target.value})}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Social Media */}
      <div className="border-t border-gray-200 pt-3 sm:pt-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Social Media (Optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="instagram" className="block text-xs text-gray-500 mb-1">
              Instagram
            </label>
            <input
              type="text"
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              placeholder="username"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="facebook" className="block text-xs text-gray-500 mb-1">
              Facebook
            </label>
            <input
              type="text"
              id="facebook"
              value={formData.facebook}
              onChange={(e) => setFormData({...formData, facebook: e.target.value})}
              placeholder="username"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-xs text-gray-500 mb-1">
              Twitter/X
            </label>
            <input
              type="text"
              id="twitter"
              value={formData.twitter}
              onChange={(e) => setFormData({...formData, twitter: e.target.value})}
              placeholder="username"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-xs text-gray-500 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:flex-1 order-2 sm:order-1 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:flex-1 order-1 sm:order-2 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="truncate">
                {uploadingLogo ? 'Uploading logo...' : 'Creating store...'}
              </span>
            </>
          ) : (
            'Create Store'
          )}
        </button>
      </div>
    </form>
  );
}