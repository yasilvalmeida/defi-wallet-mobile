import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchPortfolio,
  setSelectedAddress,
  setSelectedNetwork,
} from '../store/slices/portfolioSlice';
import { Token } from '../types/portfolio';

const PortfolioScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { portfolio, isLoading, error, selectedNetwork } = useAppSelector(
    (state) => state.portfolio
  );

  // Mock wallet address for demo
  const mockAddress =
    selectedNetwork === 'solana'
      ? '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      : '0x742d35Cc6339C4532CE58B7bdCF4777df3A747Ec';

  useEffect(() => {
    dispatch(setSelectedAddress(mockAddress));
    dispatch(
      fetchPortfolio({ address: mockAddress, network: selectedNetwork })
    );
  }, [dispatch, mockAddress, selectedNetwork]);

  const onRefresh = () => {
    if (mockAddress) {
      dispatch(
        fetchPortfolio({ address: mockAddress, network: selectedNetwork })
      );
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const toggleNetwork = () => {
    const newNetwork = selectedNetwork === 'solana' ? 'ethereum' : 'solana';
    dispatch(setSelectedNetwork(newNetwork));
  };

  const renderTokenItem = ({ item }: { item: Token }) => (
    <TouchableOpacity style={styles.tokenItem} activeOpacity={0.7}>
      <View style={styles.tokenInfo}>
        <View style={styles.tokenIcon}>
          <Text style={styles.tokenSymbol}>{item.symbol[0]}</Text>
        </View>
        <View style={styles.tokenDetails}>
          <Text style={styles.tokenName}>{item.symbol}</Text>
          <Text style={styles.tokenFullName}>{item.name}</Text>
        </View>
      </View>

      <View style={styles.tokenValues}>
        <Text style={styles.tokenBalance}>
          {parseFloat(item.balance).toFixed(4)}
        </Text>
        <View style={styles.tokenPriceContainer}>
          <Text style={styles.tokenUsdValue}>
            {formatCurrency(item.usdValue)}
          </Text>
          <Text
            style={[
              styles.tokenChange,
              { color: item.change24h >= 0 ? '#00D632' : '#FF3838' },
            ]}
          >
            {formatPercentage(item.change24h)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const portfolioChangeColor = useMemo(() => {
    if (!portfolio) return '#666';
    return portfolio.totalChangePercent24h >= 0 ? '#00D632' : '#FF3838';
  }, [portfolio?.totalChangePercent24h]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity style={styles.networkButton} onPress={toggleNetwork}>
          <Text style={styles.networkText}>
            {selectedNetwork === 'solana' ? '◉ Solana' : '⬢ Ethereum'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.totalValueLabel}>Total Portfolio Value</Text>
        <Text style={styles.totalValue}>
          {portfolio ? formatCurrency(portfolio.totalValue) : '$0.00'}
        </Text>

        {portfolio && (
          <View style={styles.changeContainer}>
            <Text style={[styles.totalChange, { color: portfolioChangeColor }]}>
              {portfolio.totalChange24h >= 0 ? '+' : ''}
              {formatCurrency(portfolio.totalChange24h)}
            </Text>
            <Text
              style={[
                styles.totalChangePercent,
                { color: portfolioChangeColor },
              ]}
            >
              ({formatPercentage(portfolio.totalChangePercent24h)})
            </Text>
          </View>
        )}

        {portfolio && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(portfolio.lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Tokens List */}
      <View style={styles.tokensContainer}>
        <Text style={styles.tokensTitle}>Assets</Text>
        <FlatList
          data={portfolio?.tokens || []}
          renderItem={renderTokenItem}
          keyExtractor={(item) => item.address}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          style={styles.tokensList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  networkButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  networkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  totalValueLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalChange: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  totalChangePercent: {
    fontSize: 18,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
  },
  tokensContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tokensTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tokensList: {
    flex: 1,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenFullName: {
    fontSize: 14,
    color: '#999',
  },
  tokenValues: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenUsdValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  tokenChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FF3838',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default PortfolioScreen;
