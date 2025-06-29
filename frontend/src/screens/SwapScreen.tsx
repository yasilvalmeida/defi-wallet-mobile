import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setFromToken,
  setToToken,
  setFromAmount,
  setSlippage,
  swapTokens,
  selectRoute,
  getJupiterQuote,
  get0xQuote,
  clearError,
  SOLANA_TOKENS,
  ETHEREUM_TOKENS,
} from '../store/slices/swapSlice';
import { Token, SwapRoute } from '../types/swap';
import { useTheme } from '../hooks/useTheme';

const SwapScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { selectedNetwork } = useAppSelector(state => state.portfolio);
  const { isConnected } = useAppSelector(state => state.wallet);
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    isLoading,
    error,
    routes,
    selectedRoute,
    priceImpact,
    minimumReceived,
  } = useAppSelector(state => state.swap);

  const [showFromTokenModal, setShowFromTokenModal] = useState(false);
  const [showToTokenModal, setShowToTokenModal] = useState(false);
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);

  const availableTokens = useMemo(() => {
    return selectedNetwork === 'solana' ? SOLANA_TOKENS : ETHEREUM_TOKENS;
  }, [selectedNetwork]);

  // Auto-get quotes when parameters change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      const request = {
        inputMint: fromToken.address,
        outputMint: toToken.address,
        amount: fromAmount,
        slippageBps: Math.round(slippage * 100),
        network: selectedNetwork,
      };

      // Delay to avoid too many API calls
      const timeout = setTimeout(() => {
        if (selectedNetwork === 'solana') {
          dispatch(getJupiterQuote(request));
        } else {
          dispatch(get0xQuote(request));
        }
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [dispatch, fromToken, toToken, fromAmount, slippage, selectedNetwork]);

  const handleSwapTokens = () => {
    dispatch(swapTokens());
  };

  const handleMaxAmount = () => {
    if (fromToken?.balance) {
      dispatch(setFromAmount(fromToken.balance));
    }
  };

  const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const formatTokenAmount = (amount: string, decimals: number = 6): string => {
    const num = parseFloat(amount);
    return num.toFixed(Math.min(decimals, 6));
  };

  const getPriceImpactColor = (impact: number): string => {
    if (impact < 0.1) return theme.colors.success;
    if (impact < 0.5) return theme.colors.warning;
    return theme.colors.error;
  };

  const renderTokenModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (token: Token) => void,
    title: string,
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: theme.colors.modalOverlay },
        ]}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.modalBackground },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={[
                  styles.modalClose,
                  { color: theme.colors.textTertiary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={availableTokens}
            keyExtractor={item => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tokenOption,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <View style={styles.tokenOptionInfo}>
                  <View
                    style={[
                      styles.tokenOptionIcon,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tokenOptionSymbol,
                        { color: theme.colors.text },
                      ]}
                    >
                      {item.symbol[0]}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.tokenOptionName,
                        { color: theme.colors.text },
                      ]}
                    >
                      {item.symbol}
                    </Text>
                    <Text
                      style={[
                        styles.tokenOptionFullName,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </View>
                {item.balance && (
                  <Text
                    style={[
                      styles.tokenOptionBalance,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {formatTokenAmount(item.balance, item.decimals)}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderSlippageModal = () => (
    <Modal visible={showSlippageModal} animationType="slide" transparent>
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: theme.colors.modalOverlay },
        ]}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.modalBackground },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Slippage Tolerance
            </Text>
            <TouchableOpacity onPress={() => setShowSlippageModal(false)}>
              <Text
                style={[
                  styles.modalClose,
                  { color: theme.colors.textTertiary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.slippageContainer}>
            {[0.1, 0.5, 1.0, 3.0].map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.slippageOption,
                  {
                    backgroundColor:
                      slippage === value
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => {
                  dispatch(setSlippage(value));
                  setShowSlippageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.slippageOptionText,
                    {
                      color: slippage === value ? '#FFFFFF' : theme.colors.text,
                    },
                  ]}
                >
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[styles.slippageInfo, { color: theme.colors.textSecondary }]}
          >
            Your transaction will revert if the price changes unfavorably by
            more than this percentage.
          </Text>
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
    headerButtons: { flexDirection: 'row', alignItems: 'center' },
    slippageButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    slippageButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    networkIndicator: { alignItems: 'center', marginBottom: 20 },
    networkText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    protocolText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    tokenContainer: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tokenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    tokenLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    maxButton: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
    tokenInputContainer: { flexDirection: 'row', alignItems: 'center' },
    tokenSelector: { marginRight: 12 },
    tokenSelectorText: {
      fontSize: 16,
      color: theme.colors.textTertiary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
    },
    selectedToken: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
    },
    selectedTokenIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    selectedTokenSymbol: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    selectedTokenText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 8,
    },
    tokenSelectorArrow: { fontSize: 12, color: theme.colors.textTertiary },
    tokenInput: {
      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'right',
    },
    tokenOutputContainer: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    tokenOutput: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
    swapButtonContainer: { alignItems: 'center', marginVertical: 8 },
    swapButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    swapButtonText: { fontSize: 20, color: theme.colors.text },
    routeInfo: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    routeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    routeTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    routeArrow: { fontSize: 12, color: theme.colors.textTertiary },
    routeDetails: {},
    routeDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    routeDetailLabel: { fontSize: 14, color: theme.colors.textSecondary },
    routeDetailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    executeButton: {
      marginHorizontal: 20,
      marginBottom: 40,
      backgroundColor: theme.colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
    },
    executeButtonDisabled: {
      backgroundColor: theme.colors.buttonDisabled,
      opacity: 0.5,
    },
    executeButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    modalClose: { fontSize: 20, color: theme.colors.textTertiary },
    tokenOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tokenOptionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    tokenOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    tokenOptionSymbol: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    tokenOptionName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    tokenOptionFullName: { fontSize: 14, color: theme.colors.textSecondary },
    tokenOptionBalance: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    slippageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 20,
    },
    slippageOption: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    slippageOptionText: { fontSize: 16, fontWeight: '600' },
    slippageInfo: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      padding: 20,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: theme.colors.error,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.buttonSecondary,
    },
    retryText: { fontSize: 16, color: theme.colors.text },
  });

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(clearError())}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swap</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.slippageButton}
            onPress={() => setShowSlippageModal(true)}
          >
            <Text style={styles.slippageButtonText}>⚙️ {slippage}%</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Network Indicator */}
      <View style={styles.networkIndicator}>
        <Text style={styles.networkText}>
          {selectedNetwork === 'solana'
            ? '🪐 Solana Network'
            : '🦄 Ethereum Network'}
        </Text>
        <Text style={styles.protocolText}>
          via{' '}
          {selectedNetwork === 'solana' ? 'Jupiter Aggregator' : '0x Protocol'}
        </Text>
      </View>

      {/* From Token */}
      <View style={styles.tokenContainer}>
        <View style={styles.tokenHeader}>
          <Text style={styles.tokenLabel}>From</Text>
          {fromToken?.balance && (
            <TouchableOpacity onPress={handleMaxAmount}>
              <Text style={styles.maxButton}>
                MAX: {formatTokenAmount(fromToken.balance, fromToken.decimals)}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tokenInputContainer}>
          <TouchableOpacity
            style={styles.tokenSelector}
            onPress={() => setShowFromTokenModal(true)}
          >
            {fromToken ? (
              <View style={styles.selectedToken}>
                <View style={styles.selectedTokenIcon}>
                  <Text style={styles.selectedTokenSymbol}>
                    {fromToken.symbol[0]}
                  </Text>
                </View>
                <Text style={styles.selectedTokenText}>{fromToken.symbol}</Text>
                <Text style={styles.tokenSelectorArrow}>▼</Text>
              </View>
            ) : (
              <Text style={styles.tokenSelectorText}>Select Token ▼</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.tokenInput}
            value={fromAmount}
            onChangeText={text => dispatch(setFromAmount(text))}
            placeholder="0.0"
            placeholderTextColor={theme.colors.inputPlaceholder}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Swap Button */}
      <View style={styles.swapButtonContainer}>
        <TouchableOpacity style={styles.swapButton} onPress={handleSwapTokens}>
          <Text style={styles.swapButtonText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* To Token */}
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>To</Text>

        <View style={styles.tokenInputContainer}>
          <TouchableOpacity
            style={styles.tokenSelector}
            onPress={() => setShowToTokenModal(true)}
          >
            {toToken ? (
              <View style={styles.selectedToken}>
                <View style={styles.selectedTokenIcon}>
                  <Text style={styles.selectedTokenSymbol}>
                    {toToken.symbol[0]}
                  </Text>
                </View>
                <Text style={styles.selectedTokenText}>{toToken.symbol}</Text>
                <Text style={styles.tokenSelectorArrow}>▼</Text>
              </View>
            ) : (
              <Text style={styles.tokenSelectorText}>Select Token ▼</Text>
            )}
          </TouchableOpacity>

          <View style={styles.tokenOutputContainer}>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.tokenOutput}>
                {toAmount ? formatTokenAmount(toAmount) : '0.0'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Route Info */}
      {selectedRoute && (
        <View style={styles.routeInfo}>
          <TouchableOpacity
            style={styles.routeHeader}
            onPress={() => setShowRoutesModal(true)}
          >
            <Text style={styles.routeTitle}>
              {selectedRoute.protocol === 'jupiter'
                ? '🪐 Jupiter Route'
                : '🦄 0x Route'}
            </Text>
            <Text style={styles.routeArrow}>▼</Text>
          </TouchableOpacity>

          <View style={styles.routeDetails}>
            <View style={styles.routeDetailRow}>
              <Text style={styles.routeDetailLabel}>Price Impact</Text>
              <Text
                style={[
                  styles.routeDetailValue,
                  { color: getPriceImpactColor(priceImpact) },
                ]}
              >
                {priceImpact.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.routeDetailRow}>
              <Text style={styles.routeDetailLabel}>Minimum Received</Text>
              <Text style={styles.routeDetailValue}>
                {minimumReceived} {toToken?.symbol}
              </Text>
            </View>

            <View style={styles.routeDetailRow}>
              <Text style={styles.routeDetailLabel}>Network Fee</Text>
              <Text style={styles.routeDetailValue}>
                ~{selectedRoute.estimatedGas}{' '}
                {selectedNetwork === 'solana' ? 'SOL' : 'ETH'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Swap Execute Button */}
      <TouchableOpacity
        style={[
          styles.executeButton,
          (!fromToken ||
            !toToken ||
            !fromAmount ||
            parseFloat(fromAmount) <= 0 ||
            !isConnected) &&
            styles.executeButtonDisabled,
        ]}
        disabled={
          !fromToken ||
          !toToken ||
          !fromAmount ||
          parseFloat(fromAmount) <= 0 ||
          !isConnected
        }
        onPress={() => {
          Alert.alert(
            'Execute Swap',
            `Swap ${fromAmount} ${fromToken?.symbol} for ~${formatTokenAmount(
              toAmount,
            )} ${toToken?.symbol}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Confirm',
                onPress: () => Alert.alert('Success', 'Swap executed! (Demo)'),
              },
            ],
          );
        }}
      >
        <Text style={styles.executeButtonText}>
          {!isConnected ? 'Connect Wallet to Swap' : 'Execute Swap'}
        </Text>
      </TouchableOpacity>

      {/* Modals */}
      {renderTokenModal(
        showFromTokenModal,
        () => setShowFromTokenModal(false),
        token => dispatch(setFromToken(token)),
        'Select Token to Swap From',
      )}
      {renderTokenModal(
        showToTokenModal,
        () => setShowToTokenModal(false),
        token => dispatch(setToToken(token)),
        'Select Token to Receive',
      )}
      {renderSlippageModal()}
    </ScrollView>
  );
};

export default SwapScreen;
