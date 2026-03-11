// app/[name]/product/[productId]/OrderButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';

interface OrderButtonProps {
  siteName: string;
  productId: string;
  productName: string;
  price: number | string;
  stock: number;
}

export default function OrderButton({ siteName, productId, productName, price, stock }: OrderButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();

  // Convert price to number safely
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const formattedPrice = numericPrice.toFixed(2);
  const totalAmount = (numericPrice * quantity).toFixed(2);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    deliveryLocation: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrder = async () => {
    if (!showCheckout) {
      setShowCheckout(true);
      return;
    }

    // Validate required fields
    if (!formData.fullName || !formData.phoneNumber || !formData.deliveryLocation) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/${siteName}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          deliveryLocation: formData.deliveryLocation,
          paymentMethod: 'cash_on_delivery'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setIsSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setShowCheckout(false);
        setQuantity(1);
        setFormData({
          fullName: '',
          phoneNumber: '',
          deliveryLocation: '',
        });
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (stock === 0) {
    return (
      <button 
        disabled
        className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2">
        <Check className="w-5 h-5" />
        Order Placed Successfully!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showCheckout ? (
        <>
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Quantity:</label>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                type="button"
              >
                -
              </button>
              <span className="px-4 py-1 text-gray-900 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                type="button"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">Max: {stock}</span>
          </div>

          {/* Order Button */}
          <button
            onClick={handleOrder}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <ShoppingCart className="w-5 h-5" />
            Order Now
          </button>

          {/* Cash on Delivery Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Cash on Delivery Available
          </div>
        </>
      ) : (
        <>
          {/* Checkout Form - Simplified for COD */}
          <div className="bg-indigo-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-indigo-700 font-medium">
              <span className="text-lg">💰</span>
              <span>Cash on Delivery</span>
            </div>
            <p className="text-sm text-indigo-600 mt-1">Pay when you receive your order</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+1 234 567 8900"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <textarea
                name="deliveryLocation"
                placeholder="Street address, city, zip code"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                required
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-xl mt-4">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Product:</span>
                <span className="text-gray-900 font-medium">{productName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="text-gray-900">${formattedPrice} × {quantity}</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600 text-lg">${totalAmount}</span>
                </div>
              </div>
              <div className="bg-green-50 p-2 rounded-lg text-center">
                <span className="text-sm text-green-700">💵 Pay {totalAmount} upon delivery</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              type="button"
            >
              Back
            </button>
            <button
              onClick={handleOrder}
              disabled={isLoading || !formData.fullName || !formData.phoneNumber || !formData.deliveryLocation}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Order'
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center mt-4">
            By placing this order, you agree to our terms and conditions
          </p>
        </>
      )}
    </div>
  );
}