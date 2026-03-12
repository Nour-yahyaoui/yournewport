// components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    await register(email, password);
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {displayError && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
          {displayError}
        </div>
      )}

      <div>
        <label htmlFor="reg-email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="reg-email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
            setLocalError('');
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          placeholder="seller@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="reg-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
            setLocalError('');
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          placeholder="••••••••"
          required
          disabled={isLoading}
          minLength={6}
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError();
            setLocalError('');
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Register'
        )}
      </button>
    </form>
  );
}