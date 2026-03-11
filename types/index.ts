// types/index.ts
export interface EcommerceSite {
  id: string;
  user_id: string;
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
  created_at: string;
}

export interface Site extends EcommerceSite {
  // Site can be the same as EcommerceSite for now
}

export interface Product {
  compareAtPrice: any;
  id: string;
  site_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  site_id: string;
  customer_id: string | null;
  customer_email: string | null;
  customer_name: string;
  customer_phone: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: string;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_zip: string | null;
  shipping_method: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithProduct extends Order {
  product_name: string;
  product_image: string | null;
  product_price: number;
}

export interface SiteWithRelations extends EcommerceSite {
  products: Product[];
  orders: OrderWithProduct[];
  customers?: any[];
  categories?: string[];
  hasMore?: boolean;
  currentPage?: number;
  totalProducts?: number;
}