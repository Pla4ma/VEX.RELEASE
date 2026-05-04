/**
 * Global Marketplace Component
 * 
 * Main UI component for global marketplace features including product browsing,
 * vendor management, transaction tracking, analytics, and international commerce.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { useGlobalMarketplace } from '../hooks/useGlobalMarketplace';

interface GlobalMarketplaceProps {
  userId: string;
  onProductPress?: (product: any) => void;
  onVendorPress?: (vendor: any) => void;
  onTransactionPress?: (transaction: any) => void;
  onCreateProduct?: () => void;
  onCreateVendor?: () => void;
}

export function GlobalMarketplace({
  userId,
  onProductPress,
  onVendorPress,
  onTransactionPress,
  onCreateProduct,
  onCreateVendor,
}: GlobalMarketplaceProps) {
  const {
    products,
    vendors,
    transactions,
    analytics,
    loading,
    error,
    filters,
    fetchProducts,
    fetchVendors,
    fetchTransactions,
    fetchAnalytics,
    searchProducts,
    filterProducts,
    createProduct,
    createVendor,
    clearError,
    resetFilters,
    refresh,
  } = useGlobalMarketplace(userId);

  const [activeTab, setActiveTab] = useState<'products' | 'vendors' | 'transactions' | 'analytics'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchProducts(query);
    } else {
      fetchProducts();
    }
  };

  const handleFilter = (newFilters: any) => {
    filterProducts({ ...filters, ...newFilters });
  };

  const renderProducts = () => (
    <View style={styles.productsContainer}>
      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>🛍️ Products</Text>
        <View style={styles.productsActions}>
          <Button
            title="Add Product"
            onPress={onCreateProduct}
            variant="primary"
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Search and Filters */}
      <Card style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search Products</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, category, or tags..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filters</Text>
          <View style={styles.filterRow}>
            <Button
              title="All Categories"
              onPress={() => handleFilter({ category: undefined })}
              variant={filters.category ? 'secondary' : 'primary'}
              style={styles.filterButton}
            />
            <Button
              title="Electronics"
              onPress={() => handleFilter({ category: 'Electronics' })}
              variant={filters.category === 'Electronics' ? 'primary' : 'secondary'}
              style={styles.filterButton}
            />
            <Button
              title="Food"
              onPress={() => handleFilter({ category: 'Food & Beverages' })}
              variant={filters.category === 'Food & Beverages' ? 'primary' : 'secondary'}
              style={styles.filterButton}
            />
          </View>
          <View style={styles.filterRow}>
            <Button
              title="Price: Low to High"
              onPress={() => handleFilter({ sortBy: 'price_low' })}
              variant={filters.sortBy === 'price_low' ? 'primary' : 'secondary'}
              style={styles.filterButton}
            />
            <Button
              title="Rating"
              onPress={() => handleFilter({ sortBy: 'rating' })}
              variant={filters.sortBy === 'rating' ? 'primary' : 'secondary'}
              style={styles.filterButton}
            />
          </View>
        </View>
      </Card>

      {/* Products List */}
      <View style={styles.productsList}>
        {products.map((product) => (
          <Card key={product.id} style={styles.productCard}>
            <TouchableOpacity onPress={() => onProductPress?.(product)}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productVendor}>{product.vendorName}</Text>
                  <View style={styles.productRating}>
                    <Text style={styles.ratingText}>⭐ {product.rating}</Text>
                    <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                  </View>
                </View>
                <View style={styles.productPrice}>
                  <Text style={styles.priceText}>
                    {product.currency} {product.price}
                  </Text>
                  <Badge
                    text={product.availability.replace('_', ' ')}
                    variant={product.availability === 'in_stock' ? 'success' : 'warning'}
                  />
                </View>
              </View>
              
              <Text style={styles.productDescription}>{product.description}</Text>
              
              <View style={styles.productTags}>
                {product.tags.map((tag, index) => (
                  <Badge key={index} text={tag} variant="secondary" />
                ))}
              </View>
              
              <View style={styles.productFooter}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productDate}>
                  Listed {product.createdAt.toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderVendors = () => (
    <View style={styles.vendorsContainer}>
      <View style={styles.vendorsHeader}>
        <Text style={styles.vendorsTitle}>🏪 Vendors</Text>
        <Button
          title="Add Vendor"
          onPress={onCreateVendor}
          variant="primary"
          style={styles.addButton}
        />
      </View>

      <View style={styles.vendorsList}>
        {vendors.map((vendor) => (
          <Card key={vendor.id} style={styles.vendorCard}>
            <TouchableOpacity onPress={() => onVendorPress?.(vendor)}>
              <View style={styles.vendorHeader}>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <Text style={styles.vendorLocation}>
                    📍 {vendor.location.city}, {vendor.location.country}
                  </Text>
                  <View style={styles.vendorRating}>
                    <Text style={styles.ratingText}>⭐ {vendor.rating}</Text>
                    <Text style={styles.reviewCount}>({vendor.reviewCount})</Text>
                  </View>
                </View>
                <Badge
                  text={vendor.verificationStatus}
                  variant={vendor.verificationStatus === 'verified' ? 'success' : 'warning'}
                />
              </View>

              <Text style={styles.vendorDescription}>{vendor.description}</Text>

              <View style={styles.vendorStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{vendor.productCount}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{vendor.totalSales}</Text>
                  <Text style={styles.statLabel}>Sales</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{vendor.responseTime}h</Text>
                  <Text style={styles.statLabel}>Response</Text>
                </View>
              </View>

              <View style={styles.vendorSpecialties}>
                {vendor.specialties.map((specialty, index) => (
                  <Badge key={index} text={specialty} variant="secondary" />
                ))}
              </View>

              <View style={styles.vendorFooter}>
                <Text style={styles.vendorLanguages}>
                  Languages: {vendor.languages.join(', ')}
                </Text>
                <Text style={styles.vendorShipping}>
                  Ships to: {vendor.shippingRegions.length} regions
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.transactionsContainer}>
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>💳 Transactions</Text>
      </View>

      <View style={styles.transactionsList}>
        {transactions.map((transaction) => (
          <Card key={transaction.id} style={styles.transactionCard}>
            <TouchableOpacity onPress={() => onTransactionPress?.(transaction)}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionProduct}>{transaction.productName}</Text>
                  <Text style={styles.transactionVendor}>{transaction.vendorId}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.amountText}>
                    {transaction.currency} {transaction.amount}
                  </Text>
                  <Badge
                    text={transaction.status}
                    variant={transaction.status === 'delivered' ? 'success' : 'primary'}
                  />
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDate}>
                  {transaction.createdAt.toLocaleDateString()}
                </Text>
                <Text style={styles.transactionStatus}>
                  Payment: {transaction.paymentStatus}
                </Text>
              </View>

              {transaction.trackingNumber && (
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingLabel}>Tracking:</Text>
                  <Text style={styles.trackingNumber}>{transaction.trackingNumber}</Text>
                </View>
              )}

              <View style={styles.transactionFooter}>
                <Text style={styles.transactionBuyer}>Buyer: {transaction.buyerId}</Text>
                <Text style={styles.transactionLocation}>
                  📍 {transaction.shippingAddress.city}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsTitle}>📊 Analytics</Text>
      </View>

      {analytics && (
        <View style={styles.analyticsContent}>
          {/* Overview Stats */}
          <Card style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Marketplace Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{analytics.totalProducts}</Text>
                <Text style={styles.overviewLabel}>Products</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{analytics.totalVendors}</Text>
                <Text style={styles.overviewLabel}>Vendors</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{analytics.totalTransactions}</Text>
                <Text style={styles.overviewLabel}>Transactions</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>
                  ${analytics.totalRevenue.toFixed(2)}
                </Text>
                <Text style={styles.overviewLabel}>Revenue</Text>
              </View>
            </View>
            <View style={styles.averageOrder}>
              <Text style={styles.averageOrderLabel}>Average Order Value:</Text>
              <Text style={styles.averageOrderValue}>
                ${analytics.averageOrderValue.toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* Top Categories */}
          <Card style={styles.categoriesCard}>
            <Text style={styles.categoriesTitle}>Top Categories</Text>
            <View style={styles.categoriesList}>
              {analytics.topCategories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryCount}>{category.count} products</Text>
                  </View>
                  <View style={styles.categoryRevenue}>
                    <Text style={styles.revenueAmount}>
                      ${category.revenue.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Top Vendors */}
          <Card style={styles.topVendorsCard}>
            <Text style={styles.topVendorsTitle}>Top Vendors</Text>
            <View style={styles.topVendorsList}>
              {analytics.topVendors.map((vendor, index) => (
                <View key={index} style={styles.topVendorItem}>
                  <View style={styles.topVendorInfo}>
                    <Text style={styles.topVendorName}>{vendor.vendorName}</Text>
                    <Text style={styles.topVendorSales}>{vendor.sales} sales</Text>
                  </View>
                  <Text style={styles.topVendorRevenue}>
                    ${vendor.revenue.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Recent Trends */}
          <Card style={styles.trendsCard}>
            <Text style={styles.trendsTitle}>Recent Trends</Text>
            <View style={styles.trendsList}>
              {analytics.recentTrends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendDate}>{trend.date}</Text>
                  <View style={styles.trendStats}>
                    <Text style={styles.trendSales}>{trend.sales} sales</Text>
                    <Text style={styles.trendRevenue}>
                      ${trend.revenue.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'products', title: 'Products', icon: '🛍️' },
        { key: 'vendors', title: 'Vendors', icon: '🏪' },
        { key: 'transactions', title: 'Transactions', icon: '💳' },
        { key: 'analytics', title: 'Analytics', icon: '📊' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            activeTab === tab.key && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return renderProducts();
      case 'vendors':
        return renderVendors();
      case 'transactions':
        return renderTransactions();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderProducts();
    }
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={clearError} variant="primary" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {renderTabBar()}
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: '#3498DB',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productsContainer: {
    padding: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
  },
  productsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    paddingHorizontal: 16,
  },
  searchCard: {
    padding: 16,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productVendor: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#F39C12',
  },
  reviewCount: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  productPrice: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
  },
  productDescription: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 12,
  },
  productTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  productDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  vendorsContainer: {
    padding: 16,
  },
  vendorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
  },
  vendorsList: {
    gap: 12,
  },
  vendorCard: {
    padding: 16,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  vendorLocation: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  vendorDescription: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 12,
  },
  vendorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  vendorSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  vendorFooter: {
    gap: 4,
  },
  vendorLanguages: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  vendorShipping: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  transactionsContainer: {
    padding: 16,
  },
  transactionsHeader: {
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  transactionVendor: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginRight: 8,
  },
  trackingNumber: {
    fontSize: 12,
    color: '#3498DB',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionBuyer: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  transactionLocation: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  analyticsContainer: {
    padding: 16,
  },
  analyticsHeader: {
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
  },
  analyticsContent: {
    gap: 16,
  },
  overviewCard: {
    padding: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  averageOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  averageOrderLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  averageOrderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  categoriesCard: {
    padding: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  categoryRevenue: {
    alignItems: 'flex-end',
  },
  revenueAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  topVendorsCard: {
    padding: 16,
  },
  topVendorsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  topVendorsList: {
    gap: 8,
  },
  topVendorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  topVendorInfo: {
    flex: 1,
  },
  topVendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  topVendorSales: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  topVendorRevenue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  trendsCard: {
    padding: 16,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  trendsList: {
    gap: 8,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trendDate: {
    fontSize: 14,
    color: '#7F8C8D',
    width: 100,
  },
  trendStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendSales: {
    fontSize: 14,
    color: '#2C3E50',
  },
  trendRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
});
