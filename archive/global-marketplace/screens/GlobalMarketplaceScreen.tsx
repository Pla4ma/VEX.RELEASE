/**
 * Global Marketplace Screen
 * 
 * Full-screen container for global marketplace features including product browsing,
 * vendor management, transaction tracking, analytics, and international commerce.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlobalMarketplace } from '../components/GlobalMarketplace';
import { GlobalMarketplaceLoading } from '../components/GlobalMarketplaceLoading';
import { GlobalMarketplaceError } from '../components/GlobalMarketplaceError';
import { useGlobalMarketplace } from '../hooks/useGlobalMarketplace';

export function GlobalMarketplaceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { loading, error, initialize, clearError } = useGlobalMarketplace(userId);

  useEffect(() => {
    navigation.setOptions({
      title: 'Global Marketplace',
      headerStyle: {
        backgroundColor: '#9B59B6',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });
  }, [navigation]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { productId: product.id, userId });
  };

  const handleVendorPress = (vendor: any) => {
    navigation.navigate('VendorDetail', { vendorId: vendor.id, userId });
  };

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id, userId });
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct', { userId });
  };

  const handleCreateVendor = () => {
    navigation.navigate('CreateVendor', { userId });
  };

  if (loading) {
    return <GlobalMarketplaceLoading />;
  }

  if (error) {
    return (
      <GlobalMarketplaceError
        error={error}
        onRetry={initialize}
        onDismiss={clearError}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GlobalMarketplace
        userId={userId}
        onProductPress={handleProductPress}
        onVendorPress={handleVendorPress}
        onTransactionPress={handleTransactionPress}
        onCreateProduct={handleCreateProduct}
        onCreateVendor={handleCreateVendor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
