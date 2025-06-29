import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  TextInput,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateSetting,
  toggleTheme,
  loadSettings,
  saveSettings,
  addCustomToken,
  addCustomRPC,
  removeCustomToken,
  removeCustomRPC,
  setDefaultRPC,
  resetSettings,
} from '../store/slices/settingsSlice';
import { CustomToken, CustomRPC } from '../types/settings';
import { useTheme } from '../hooks/useTheme';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const { isConnected, address } = useAppSelector(state => state.wallet);
  const { selectedNetwork } = useAppSelector(state => state.portfolio);

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAutoLockModal, setShowAutoLockModal] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [showAddRPCModal, setShowAddRPCModal] = useState(false);
  const [showRPCListModal, setShowRPCListModal] = useState(false);

  // Form states for modals
  const [newToken, setNewToken] = useState({
    address: '',
    symbol: '',
    name: '',
    decimals: 18,
    network: 'ethereum' as 'solana' | 'ethereum',
  });
  const [newRPC, setNewRPC] = useState({
    name: '',
    url: '',
    network: 'ethereum' as 'solana' | 'ethereum',
    chainId: 1,
  });

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    dispatch(updateSetting({ key, value }));
    dispatch(saveSettings({ [key]: value }));
  };

  const handleAddCustomToken = () => {
    if (!newToken.address || !newToken.symbol || !newToken.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    dispatch(addCustomToken(newToken));
    setNewToken({
      address: '',
      symbol: '',
      name: '',
      decimals: 18,
      network: 'ethereum',
    });
    setShowAddTokenModal(false);
  };

  const handleAddCustomRPC = () => {
    if (!newRPC.name || !newRPC.url) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    dispatch(addCustomRPC({ ...newRPC, isDefault: false }));
    setNewRPC({
      name: '',
      url: '',
      network: 'ethereum',
      chainId: 1,
    });
    setShowAddRPCModal(false);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default? This will not affect your connected wallets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(resetSettings());
            dispatch(saveSettings({}));
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Check out DeFi Wallet Mobile - The ultimate cross-platform DeFi wallet!',
        url: 'https://defiwallet.mobile',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  const renderSettingRow = (
    title: string,
    value?: string,
    onPress?: () => void,
    hasSwitch?: boolean,
    switchValue?: boolean,
    onSwitchChange?: (value: boolean) => void,
    subtitle?: string,
    icon?: string,
  ) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{
              false: theme.colors.surfaceVariant,
              true: theme.colors.primary,
            }}
            thumbColor={'#FFFFFF'}
          />
        ) : (
          <View style={styles.settingValueContainer}>
            {value && (
              <Text
                style={[styles.settingValue, { color: theme.colors.primary }]}
              >
                {value}
              </Text>
            )}
            {onPress && (
              <Text
                style={[
                  styles.settingArrow,
                  { color: theme.colors.textTertiary },
                ]}
              >
                ›
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    content: React.ReactNode,
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
          {content}
        </View>
      </View>
    </Modal>
  );

  const themeOptions = [
    {
      value: 'dark',
      label: '🌙 Dark',
      description: 'Dark theme for all screens',
    },
    {
      value: 'light',
      label: '☀️ Light',
      description: 'Light theme for all screens',
    },
    {
      value: 'system',
      label: '📱 System',
      description: 'Follow system preference',
    },
  ];

  const currencyOptions = [
    { value: 'USD', label: '🇺🇸 USD', symbol: '$' },
    { value: 'EUR', label: '🇪🇺 EUR', symbol: '€' },
    { value: 'GBP', label: '🇬🇧 GBP', symbol: '£' },
    { value: 'JPY', label: '🇯🇵 JPY', symbol: '¥' },
    { value: 'BTC', label: '₿ BTC', symbol: '₿' },
    { value: 'ETH', label: '⬢ ETH', symbol: 'Ξ' },
  ];

  const languageOptions = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'de', label: '��🇪 Deutsch' },
    { value: 'ja', label: '🇯🇵 日本語' },
    { value: 'ko', label: '🇰🇷 한국어' },
    { value: 'zh', label: '🇨🇳 中文' },
  ];

  const autoLockOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

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
    resetButton: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    section: { marginBottom: 32 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    sectionContent: {
      marginHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    settingIcon: { fontSize: 20, marginRight: 12 },
    settingInfo: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    settingSubtitle: { fontSize: 14 },
    settingRight: { alignItems: 'flex-end' },
    settingValueContainer: { flexDirection: 'row', alignItems: 'center' },
    settingValue: { fontSize: 16, marginRight: 8 },
    settingArrow: { fontSize: 18 },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalClose: { fontSize: 20 },
    optionItem: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    optionItemSelected: { backgroundColor: theme.colors.surfaceVariant },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    optionDescription: { fontSize: 14, color: theme.colors.textSecondary },
    formContainer: { padding: 20 },
    formInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    networkSelector: { flexDirection: 'row', marginBottom: 20 },
    networkOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    networkOptionSelected: { backgroundColor: theme.colors.primary },
    networkOptionText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleResetSettings}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* App Preferences */}
      {renderSection(
        '�� App Preferences',
        <>
          {renderSettingRow(
            'Theme',
            themeOptions.find(t => t.value === settings.theme)?.label,
            () => setShowThemeModal(true),
            false,
            undefined,
            undefined,
            'Choose your preferred color scheme',
          )}
          {renderSettingRow(
            'Currency',
            currencyOptions.find(c => c.value === settings.currency)?.label,
            () => setShowCurrencyModal(true),
            false,
            undefined,
            undefined,
            'Default currency for prices',
          )}
          {renderSettingRow(
            'Language',
            languageOptions.find(l => l.value === settings.language)?.label,
            () => setShowLanguageModal(true),
            false,
            undefined,
            undefined,
            'App display language',
          )}
          {renderSettingRow(
            'Default Network',
            settings.defaultNetwork === 'solana' ? '🪐 Solana' : '⬢ Ethereum',
            () => {
              const newNetwork =
                settings.defaultNetwork === 'solana' ? 'ethereum' : 'solana';
              handleSettingChange('defaultNetwork', newNetwork);
            },
            false,
            undefined,
            undefined,
            'Primary network for new wallets',
          )}
          {renderSettingRow(
            'Compact Mode',
            undefined,
            undefined,
            true,
            settings.compactMode,
            value => handleSettingChange('compactMode', value),
            'Smaller UI elements and spacing',
          )}
          {renderSettingRow(
            'Hide Small Balances',
            undefined,
            undefined,
            true,
            settings.hideSmallBalances,
            value => handleSettingChange('hideSmallBalances', value),
            `Hide tokens below $${settings.smallBalanceThreshold}`,
          )}
        </>,
      )}

      {/* Security Settings */}
      {renderSection(
        '🔒 Security',
        <>
          {renderSettingRow(
            'Biometric Authentication',
            undefined,
            undefined,
            true,
            settings.biometricEnabled,
            value => handleSettingChange('biometricEnabled', value),
            'Use Face ID or Fingerprint to unlock',
          )}
          {renderSettingRow(
            'Auto-Lock',
            undefined,
            undefined,
            true,
            settings.autoLockEnabled,
            value => handleSettingChange('autoLockEnabled', value),
            'Automatically lock the app',
          )}
          {settings.autoLockEnabled &&
            renderSettingRow(
              'Auto-Lock Timer',
              autoLockOptions.find(t => t.value === settings.autoLockTimer)
                ?.label,
              () => setShowAutoLockModal(true),
              false,
              undefined,
              undefined,
              'Time before app locks automatically',
            )}
          {renderSettingRow(
            'PIN Code',
            undefined,
            undefined,
            true,
            settings.pinEnabled,
            value => handleSettingChange('pinEnabled', value),
            'Use PIN to unlock the app',
          )}
          {renderSettingRow(
            'Security Warnings',
            undefined,
            undefined,
            true,
            settings.securityWarningsEnabled,
            value => handleSettingChange('securityWarningsEnabled', value),
            'Show security tips and warnings',
          )}
        </>,
      )}

      {/* Wallet Management */}
      {renderSection(
        '💼 Wallet Management',
        <>
          {isConnected &&
            renderSettingRow(
              'Connected Wallet',
              address
                ? `${address.slice(0, 8)}...${address.slice(-8)}`
                : 'Unknown',
              undefined,
              false,
              undefined,
              undefined,
              selectedNetwork === 'solana'
                ? '👻 Phantom Wallet'
                : '🦊 MetaMask',
              '🔗',
            )}
          {renderSettingRow(
            'Network RPCs',
            `${settings.customRPCs.length} configured`,
            () => setShowRPCListModal(true),
            false,
            undefined,
            undefined,
            'Manage blockchain network endpoints',
            '🌐',
          )}
          {renderSettingRow(
            'Custom Tokens',
            `${settings.customTokens.length} added`,
            () => setShowAddTokenModal(true),
            false,
            undefined,
            undefined,
            'Add custom ERC-20 or SPL tokens',
            '🪙',
          )}
          {renderSettingRow(
            'Show Test Networks',
            undefined,
            undefined,
            true,
            settings.showTestNetworks,
            value => handleSettingChange('showTestNetworks', value),
            'Display testnet and devnet options',
          )}
        </>,
      )}

      {/* Notifications */}
      {renderSection(
        '🔔 Notifications',
        <>
          {renderSettingRow(
            'Push Notifications',
            undefined,
            undefined,
            true,
            settings.pushNotificationsEnabled,
            value => handleSettingChange('pushNotificationsEnabled', value),
            'Allow app to send notifications',
          )}
          {renderSettingRow(
            'Transaction Updates',
            undefined,
            undefined,
            true,
            settings.transactionNotificationsEnabled,
            value =>
              handleSettingChange('transactionNotificationsEnabled', value),
            'Notify when transactions complete',
          )}
          {renderSettingRow(
            'Price Alerts',
            undefined,
            undefined,
            true,
            settings.priceAlertsEnabled,
            value => handleSettingChange('priceAlertsEnabled', value),
            'Notify on significant price changes',
          )}
          {renderSettingRow(
            'Portfolio Updates',
            undefined,
            undefined,
            true,
            settings.portfolioUpdatesEnabled,
            value => handleSettingChange('portfolioUpdatesEnabled', value),
            'Daily portfolio performance summary',
          )}
          {renderSettingRow(
            'Market News',
            undefined,
            undefined,
            true,
            settings.marketNewsEnabled,
            value => handleSettingChange('marketNewsEnabled', value),
            'Breaking news from DeFi protocols',
          )}
        </>,
      )}

      {/* Privacy */}
      {renderSection(
        '🛡️ Privacy',
        <>
          {renderSettingRow(
            'Analytics',
            undefined,
            undefined,
            true,
            settings.analyticsEnabled,
            value => handleSettingChange('analyticsEnabled', value),
            'Help improve the app with usage data',
          )}
          {renderSettingRow(
            'Crash Reporting',
            undefined,
            undefined,
            true,
            settings.crashReportingEnabled,
            value => handleSettingChange('crashReportingEnabled', value),
            'Automatically report crashes to developers',
          )}
        </>,
      )}

      {/* About & Support */}
      {renderSection(
        'ℹ️ About & Support',
        <>
          {renderSettingRow(
            'App Version',
            `${settings.appVersion} (${settings.buildNumber})`,
            undefined,
            false,
            undefined,
            undefined,
            'Current app version and build',
          )}
          {renderSettingRow(
            'Help & FAQ',
            undefined,
            () => openURL('https://docs.defiwallet.mobile'),
            false,
            undefined,
            undefined,
            'Get help and find answers',
            '❓',
          )}
          {renderSettingRow(
            'Contact Support',
            undefined,
            () => openURL('mailto:support@defiwallet.mobile'),
            false,
            undefined,
            undefined,
            'Email our support team',
            '📧',
          )}
          {renderSettingRow(
            'Share App',
            undefined,
            handleShare,
            false,
            undefined,
            undefined,
            'Share DeFi Wallet with friends',
            '📤',
          )}
          {renderSettingRow(
            'Rate App',
            undefined,
            () => openURL('https://apps.apple.com/app/defiwallet'),
            false,
            undefined,
            undefined,
            'Rate us on the App Store',
            '⭐',
          )}
        </>,
      )}

      {/* Modals */}
      {renderModal(
        showThemeModal,
        () => setShowThemeModal(false),
        'Choose Theme',
        <FlatList
          data={themeOptions}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                settings.theme === item.value && styles.optionItemSelected,
              ]}
              onPress={() => {
                handleSettingChange('theme', item.value);
                setShowThemeModal(false);
              }}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
              <Text style={styles.optionDescription}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />,
      )}

      {renderModal(
        showCurrencyModal,
        () => setShowCurrencyModal(false),
        'Choose Currency',
        <FlatList
          data={currencyOptions}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                settings.currency === item.value && styles.optionItemSelected,
              ]}
              onPress={() => {
                handleSettingChange('currency', item.value);
                setShowCurrencyModal(false);
              }}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
              <Text style={styles.optionDescription}>
                Symbol: {item.symbol}
              </Text>
            </TouchableOpacity>
          )}
        />,
      )}

      {renderModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        'Choose Language',
        <FlatList
          data={languageOptions}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                settings.language === item.value && styles.optionItemSelected,
              ]}
              onPress={() => {
                handleSettingChange('language', item.value);
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />,
      )}

      {renderModal(
        showAutoLockModal,
        () => setShowAutoLockModal(false),
        'Auto-Lock Timer',
        <FlatList
          data={autoLockOptions}
          keyExtractor={item => item.value.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                settings.autoLockTimer === item.value &&
                  styles.optionItemSelected,
              ]}
              onPress={() => {
                handleSettingChange('autoLockTimer', item.value);
                setShowAutoLockModal(false);
              }}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />,
      )}

      {/* Add Custom Token Modal */}
      {renderModal(
        showAddTokenModal,
        () => setShowAddTokenModal(false),
        'Add Custom Token',
        <View style={styles.formContainer}>
          <TextInput
            style={styles.formInput}
            placeholder="Token Contract Address"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={newToken.address}
            onChangeText={text => setNewToken({ ...newToken, address: text })}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Token Symbol (e.g., USDC)"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={newToken.symbol}
            onChangeText={text =>
              setNewToken({ ...newToken, symbol: text.toUpperCase() })
            }
          />
          <TextInput
            style={styles.formInput}
            placeholder="Token Name (e.g., USD Coin)"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={newToken.name}
            onChangeText={text => setNewToken({ ...newToken, name: text })}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Decimals (e.g., 18)"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={newToken.decimals.toString()}
            onChangeText={text =>
              setNewToken({ ...newToken, decimals: parseInt(text) || 18 })
            }
            keyboardType="numeric"
          />

          <View style={styles.networkSelector}>
            <TouchableOpacity
              style={[
                styles.networkOption,
                newToken.network === 'ethereum' && styles.networkOptionSelected,
              ]}
              onPress={() => setNewToken({ ...newToken, network: 'ethereum' })}
            >
              <Text
                style={[
                  styles.networkOptionText,
                  {
                    color:
                      newToken.network === 'ethereum'
                        ? '#FFFFFF'
                        : theme.colors.text,
                  },
                ]}
              >
                ⬢ Ethereum
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.networkOption,
                newToken.network === 'solana' && styles.networkOptionSelected,
              ]}
              onPress={() => setNewToken({ ...newToken, network: 'solana' })}
            >
              <Text
                style={[
                  styles.networkOptionText,
                  {
                    color:
                      newToken.network === 'solana'
                        ? '#FFFFFF'
                        : theme.colors.text,
                  },
                ]}
              >
                🪐 Solana
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAddCustomToken}
          >
            <Text style={styles.submitButtonText}>Add Token</Text>
          </TouchableOpacity>
        </View>,
      )}
    </ScrollView>
  );
};

export default SettingsScreen;
