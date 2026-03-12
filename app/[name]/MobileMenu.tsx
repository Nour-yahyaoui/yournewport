// app/[name]/MobileMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, ShoppingBag, Tag, Info, Phone } from 'lucide-react';

interface MobileMenuProps {
  siteName: string;
}

export default function MobileMenu({ siteName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: `/${siteName}`, label: 'Home', icon: Home },
    { href: `/${siteName}#shop`, label: 'Shop', icon: ShoppingBag },
    { href: `/${siteName}#Deals`, label: 'Deals', icon: Tag },
    { href: `/${siteName}#About`, label: 'About', icon: Info },
    { href: `/${siteName}#Contact`, label: 'Contact', icon: Phone },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}