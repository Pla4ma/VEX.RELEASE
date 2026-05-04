/**
 * Global Marketplace Hook
 * 
 * Hook for managing global marketplace features including product listings,
 * vendor management, marketplace analytics, transaction processing,
 * and international commerce functionality.
 */

import { useState, useEffect, useCallback } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  vendorId: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  shippingOptions: string[];
  specifications: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  location: {
    country: string;
    city: string;
    address: string;
  };
  rating: number;
  reviewCount: number;
  totalSales: number;
  productCount: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  specialties: string[];
  languages: string[];
  shippingRegions: string[];
  paymentMethods: string[];
  responseTime: number; // in hours
  joinDate: Date;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceAnalytics {
  totalProducts: number;
  totalVendors: number;
  totalTransactions: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    sales: number;
    revenue: number;
  }>;
  recentTrends: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

export interface MarketplaceFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  vendorVerified?: boolean;
  shippingRegion?: string;
  availability?: Product['availability'];
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
  searchQuery?: string;
}

export interface UseGlobalMarketplaceReturn {
  // State
  products: Product[];
  vendors: Vendor[];
  transactions: Transaction[];
  analytics: MarketplaceAnalytics | null;
  loading: boolean;
  error: string | null;
  filters: MarketplaceFilters;

  // Products
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  filterProducts: (filters: MarketplaceFilters) => Promise<void>;

  // Vendors
  fetchVendors: () => Promise<void>;
  createVendor: (vendor: Omit<Vendor, 'id' | 'joinDate'>) => Promise<void>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  verifyVendor: (id: string) => Promise<void>;

  // Transactions
  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  cancelTransaction: (id: string) => Promise<void>;
  refundTransaction: (id: string) => Promise<void>;

  // Analytics
  fetchAnalytics: () => Promise<void>;
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>;

  // Utility
  clearError: () => void;
  resetFilters: () => void;
  refresh: () => void;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    price: 299.99,
    currency: 'USD',
    vendorId: '1',
    vendorName: 'TechGear Pro',
    rating: 4.5,
    reviewCount: 234,
    images: ['headphones1.jpg', 'headphones2.jpg'],
    tags: ['wireless', 'noise-cancelling', 'premium'],
    availability: 'in_stock',
    shippingOptions: ['standard', 'express', 'international'],
    specifications: {
      batteryLife: '30 hours',
      weight: '250g',
      connectivity: 'Bluetooth 5.0'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Organic Coffee Beans',
    description: 'Premium organic coffee beans from sustainable farms',
    category: 'Food & Beverages',
    price: 24.99,
    currency: 'USD',
    vendorId: '2',
    vendorName: 'Green Harvest Co',
    rating: 4.8,
    reviewCount: 567,
    images: ['coffee1.jpg', 'coffee2.jpg'],
    tags: ['organic', 'fair-trade', 'premium'],
    availability: 'in_stock',
    shippingOptions: ['standard', 'express'],
    specifications: {
      weight: '1kg',
      roast: 'Medium',
      origin: 'Colombia'
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Smart Home Security Camera',
    description: 'AI-powered security camera with motion detection',
    category: 'Smart Home',
    price: 149.99,
    currency: 'USD',
    vendorId: '1',
    vendorName: 'TechGear Pro',
    rating: 4.3,
    reviewCount: 189,
    images: ['camera1.jpg', 'camera2.jpg'],
    tags: ['smart-home', 'security', 'AI'],
    availability: 'in_stock',
    shippingOptions: ['standard', 'express', 'international'],
    specifications: {
      resolution: '4K',
      nightVision: true,
      storage: 'Cloud + Local'
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
  },
];

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'TechGear Pro',
    description: 'Premium electronics and smart home devices',
    email: 'support@techgearpro.com',
    phone: '+1-555-0123',
    location: {
      country: 'United States',
      city: 'San Francisco',
      address: '123 Tech Street, CA 94105'
    },
    rating: 4.6,
    reviewCount: 1234,
    totalSales: 45678,
    productCount: 23,
    verificationStatus: 'verified',
    specialties: ['Electronics', 'Smart Home', 'Audio'],
    languages: ['English', 'Spanish'],
    shippingRegions: ['US', 'Canada', 'Europe', 'Asia'],
    paymentMethods: ['Credit Card', 'PayPal', 'Apple Pay'],
    responseTime: 2,
    joinDate: new Date('2023-06-15'),
  },
  {
    id: '2',
    name: 'Green Harvest Co',
    description: 'Organic and sustainable food products',
    email: 'hello@greenharvest.com',
    phone: '+1-555-0456',
    location: {
      country: 'United States',
      city: 'Seattle',
      address: '456 Organic Ave, WA 98101'
    },
    rating: 4.9,
    reviewCount: 890,
    totalSales: 23456,
    productCount: 45,
    verificationStatus: 'verified',
    specialties: ['Organic Food', 'Beverages', 'Sustainable'],
    languages: ['English'],
    shippingRegions: ['US', 'Canada'],
    paymentMethods: ['Credit Card', 'PayPal'],
    responseTime: 1,
    joinDate: new Date('2023-03-20'),
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Premium Wireless Headphones',
    vendorId: '1',
    buyerId: 'buyer1',
    amount: 299.99,
    currency: 'USD',
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '789 Customer Lane',
      city: 'New York',
      country: 'United States',
      postalCode: '10001'
    },
    trackingNumber: 'TN123456789',
    estimatedDelivery: new Date('2024-02-01'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '2',
    productId: '2',
    productName: 'Organic Coffee Beans',
    vendorId: '2',
    buyerId: 'buyer2',
    amount: 24.99,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '321 Brew Street',
      city: 'Portland',
      country: 'United States',
      postalCode: '97201'
    },
    trackingNumber: 'TN987654321',
    estimatedDelivery: new Date('2024-01-28'),
    actualDelivery: new Date('2024-01-27'),
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-27'),
  },
];

const mockAnalytics: MarketplaceAnalytics = {
  totalProducts: 156,
  totalVendors: 34,
  totalTransactions: 1234,
  totalRevenue: 45678.90,
  averageOrderValue: 37.04,
  topCategories: [
    { category: 'Electronics', count: 45, revenue: 12345.67 },
    { category: 'Food & Beverages', count: 32, revenue: 8901.23 },
    { category: 'Smart Home', count: 28, revenue: 6789.01 },
  ],
  topVendors: [
    { vendorId: '1', vendorName: 'TechGear Pro', sales: 234, revenue: 12345.67 },
    { vendorId: '2', vendorName: 'Green Harvest Co', sales: 189, revenue: 8901.23 },
  ],
  recentTrends: [
    { date: '2024-01-20', sales: 45, revenue: 1234.56 },
    { date: '2024-01-21', sales: 52, revenue: 1456.78 },
    { date: '2024-01-22', sales: 48, revenue: 1345.67 },
  ],
};

export function useGlobalMarketplace(userId: string): UseGlobalMarketplaceReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<MarketplaceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({});

  // Initialize data
  useEffect(() => {
    refresh();
  }, [userId]);

  // Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError('Failed to create product');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(prev => prev.map(product => 
        product.id === id 
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      ));
    } catch (err) {
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setProducts(filtered);
    } catch (err) {
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProducts = useCallback(async (newFilters: MarketplaceFilters) => {
    setLoading(true);
    setError(null);
    setFilters(newFilters);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockProducts];

      if (newFilters.category) {
        filtered = filtered.filter(p => p.category === newFilters.category);
      }

      if (newFilters.priceRange) {
        filtered = filtered.filter(p => 
          p.price >= newFilters.priceRange!.min && 
          p.price <= newFilters.priceRange!.max
        );
      }

      if (newFilters.rating) {
        filtered = filtered.filter(p => p.rating >= newFilters.rating);
      }

      if (newFilters.vendorVerified) {
        const verifiedVendorIds = mockVendors
          .filter(v => v.verificationStatus === 'verified')
          .map(v => v.id);
        filtered = filtered.filter(p => verifiedVendorIds.includes(p.vendorId));
      }

      if (newFilters.availability) {
        filtered = filtered.filter(p => p.availability === newFilters.availability);
      }

      if (newFilters.sortBy) {
        switch (newFilters.sortBy) {
          case 'price_low':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price_high':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
          case 'popular':
            filtered.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
        }
      }

      setProducts(filtered);
    } catch (err) {
      setError('Failed to filter products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Vendors
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVendors(mockVendors);
    } catch (err) {
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVendor = useCallback(async (vendor: Omit<Vendor, 'id' | 'joinDate'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newVendor: Vendor = {
        ...vendor,
        id: Date.now().toString(),
        joinDate: new Date(),
      };
      setVendors(prev => [...prev, newVendor]);
    } catch (err) {
      setError('Failed to create vendor');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendor = useCallback(async (id: string, updates: Partial<Vendor>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVendors(prev => prev.map(vendor => 
        vendor.id === id ? { ...vendor, ...updates } : vendor
      ));
    } catch (err) {
      setError('Failed to update vendor');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVendor = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVendors(prev => prev.filter(vendor => vendor.id !== id));
    } catch (err) {
      setError('Failed to delete vendor');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyVendor = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVendors(prev => prev.map(vendor => 
        vendor.id === id 
          ? { ...vendor, verificationStatus: 'verified' as const }
          : vendor
      ));
    } catch (err) {
      setError('Failed to verify vendor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTransactions(prev => [...prev, newTransaction]);
    } catch (err) {
      setError('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, ...updates, updatedAt: new Date() }
          : transaction
      ));
    } catch (err) {
      setError('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTransaction = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, status: 'cancelled' as const, updatedAt: new Date() }
          : transaction
      ));
    } catch (err) {
      setError('Failed to cancel transaction');
    } finally {
      setLoading(false);
    }
  }, []);

  const refundTransaction = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id 
          ? { 
              ...transaction, 
              status: 'refunded' as const, 
              paymentStatus: 'refunded' as const,
              updatedAt: new Date() 
            }
          : transaction
      ));
    } catch (err) {
      setError('Failed to refund transaction');
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting data as ${format}`);
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    fetchProducts();
  }, [fetchProducts]);

  const refresh = useCallback(() => {
    Promise.all([
      fetchProducts(),
      fetchVendors(),
      fetchTransactions(),
      fetchAnalytics(),
    ]);
  }, [fetchProducts, fetchVendors, fetchTransactions, fetchAnalytics]);

  return {
    // State
    products,
    vendors,
    transactions,
    analytics,
    loading,
    error,
    filters,

    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProducts,

    // Vendors
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    verifyVendor,

    // Transactions
    fetchTransactions,
    createTransaction,
    updateTransaction,
    cancelTransaction,
    refundTransaction,

    // Analytics
    fetchAnalytics,
    exportData,

    // Utility
    clearError,
    resetFilters,
    refresh,
  };
}
