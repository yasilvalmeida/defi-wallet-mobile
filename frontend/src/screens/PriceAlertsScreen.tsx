import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Switch,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import {
  useGetUserPriceAlertsQuery,
  useCreatePriceAlertMutation,
  useUpdatePriceAlertMutation,
  useDeletePriceAlertMutation,
  useTogglePriceAlertMutation,
  useSendTestNotificationMutation,
  PriceAlert,
  CreatePriceAlertRequest,
} from '../store/api/notificationsApi';

// Mock user ID - in a real app, this would come from authentication
const MOCK_USER_ID = 'user-123';

const PriceAlertsScreen: React.FC = () => {
  const theme = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePriceAlertRequest>({
    tokenSymbol: '',
    condition: 'above',
    targetPrice: 0,
    currency: 'USD',
    network: 'ethereum',
  });

  // API hooks
  const {
    data: alerts = [],
    refetch,
    isLoading,
  } = useGetUserPriceAlertsQuery(MOCK_USER_ID);
  const [createAlert] = useCreatePriceAlertMutation();
  const [updateAlert] = useUpdatePriceAlertMutation();
  const [deleteAlert] = useDeletePriceAlertMutation();
  const [toggleAlert] = useTogglePriceAlertMutation();
  const [sendTestNotification] = useSendTestNotificationMutation();

  const handleCreateAlert = async () => {
    try {
      if (!formData.tokenSymbol || formData.targetPrice <= 0) {
        Alert.alert(
          'Error',
          'Please fill in all required fields with valid values',
        );
        return;
      }

      await createAlert({
        userId: MOCK_USER_ID,
        alertData: formData,
      }).unwrap();

      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Price alert created successfully!');
    } catch (error) {
      console.error('Error creating alert:', error);
      Alert.alert('Error', 'Failed to create price alert. Please try again.');
    }
  };

  const handleEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setFormData({
      tokenSymbol: alert.tokenSymbol,
      condition: alert.condition,
      targetPrice: alert.targetPrice,
      currency: alert.currency,
      network: alert.network,
      tokenAddress: alert.tokenAddress,
    });
    setShowCreateModal(true);
  };

  const handleUpdateAlert = async () => {
    if (!editingAlert) return;

    try {
      await updateAlert({
        userId: MOCK_USER_ID,
        alertId: editingAlert.id,
        updateData: {
          condition: formData.condition,
          targetPrice: formData.targetPrice,
        },
      }).unwrap();

      setShowCreateModal(false);
      setEditingAlert(null);
      resetForm();
      Alert.alert('Success', 'Price alert updated successfully!');
    } catch (error) {
      console.error('Error updating alert:', error);
      Alert.alert('Error', 'Failed to update price alert. Please try again.');
    }
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this price alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlert({ userId: MOCK_USER_ID, alertId }).unwrap();
              Alert.alert('Success', 'Price alert deleted successfully!');
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert(
                'Error',
                'Failed to delete price alert. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleToggleAlert = async (alertId: string) => {
    try {
      await toggleAlert({ userId: MOCK_USER_ID, alertId }).unwrap();
    } catch (error) {
      console.error('Error toggling alert:', error);
      Alert.alert('Error', 'Failed to toggle price alert. Please try again.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification(MOCK_USER_ID).unwrap();
      Alert.alert(
        'Success',
        'Test notification sent! Check your notifications.',
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert(
        'Error',
        'Failed to send test notification. Please try again.',
      );
    }
  };

  const resetForm = () => {
    setFormData({
      tokenSymbol: '',
      condition: 'above',
      targetPrice: 0,
      currency: 'USD',
      network: 'ethereum',
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingAlert(null);
    resetForm();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const getAlertStatusColor = (alert: PriceAlert) => {
    if (!alert.isActive) return theme.colors.textTertiary;

    const isPriceAboveTarget = alert.currentPrice >= alert.targetPrice;
    if (alert.condition === 'above' && isPriceAboveTarget) {
      return '#FF6B6B'; // Red for triggered condition
    } else if (alert.condition === 'below' && !isPriceAboveTarget) {
      return '#FF6B6B'; // Red for triggered condition
    }
    return theme.colors.primary; // Active but not triggered
  };

  const renderAlert = ({ item: alert }: { item: PriceAlert }) => (
    <View
      style={[
        styles.alertCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleContainer}>
          <Text style={[styles.tokenSymbol, { color: theme.colors.text }]}>
            {alert.tokenSymbol}
          </Text>
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: getAlertStatusColor(alert) },
            ]}
          >
            <Text style={styles.conditionText}>
              {alert.condition} {formatPrice(alert.targetPrice)}
            </Text>
          </View>
        </View>
        <Switch
          value={alert.isActive}
          onValueChange={() => handleToggleAlert(alert.id)}
          trackColor={{
            false: theme.colors.surfaceVariant,
            true: theme.colors.primary,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.alertDetails}>
        <View style={styles.priceRow}>
          <Text
            style={[styles.priceLabel, { color: theme.colors.textSecondary }]}
          >
            Current Price:
          </Text>
          <Text style={[styles.currentPrice, { color: theme.colors.text }]}>
            {formatPrice(alert.currentPrice)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
            Network: {alert.network === 'ethereum' ? '⬢ Ethereum' : '🪐 Solana'}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
            Triggered: {alert.triggerCount} times
          </Text>
        </View>

        {alert.lastTriggeredAt && (
          <Text
            style={[styles.lastTriggered, { color: theme.colors.textTertiary }]}
          >
            Last triggered:{' '}
            {new Date(alert.lastTriggeredAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.buttonSecondary },
          ]}
          onPress={() => handleEditAlert(alert)}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => handleDeleteAlert(alert.id)}
        >
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    testButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    testButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    content: { flex: 1, paddingHorizontal: 20 },
    createButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
    },
    createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyStateText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    alertCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    alertTitleContainer: { flex: 1 },
    tokenSymbol: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    conditionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    conditionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    alertDetails: { marginBottom: 12 },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    priceLabel: { fontSize: 14 },
    currentPrice: { fontSize: 16, fontWeight: '600' },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    metaText: { fontSize: 12 },
    lastTriggered: { fontSize: 12, fontStyle: 'italic' },
    alertActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    actionButtonText: { fontSize: 14, fontWeight: '600' },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    closeButton: { padding: 4 },
    closeButtonText: { fontSize: 24, color: theme.colors.textTertiary },
    formField: { marginBottom: 16 },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: theme.colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    pickerOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pickerOptionSelected: { backgroundColor: theme.colors.primary },
    pickerOptionText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    pickerOptionTextSelected: { color: '#FFFFFF' },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotification}
        >
          <Text style={styles.testButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create New Alert</Text>
        </TouchableOpacity>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No price alerts yet.{'\n'}Create your first alert to get notified
              when prices reach your targets!
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            renderItem={renderAlert}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Create/Edit Alert Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingAlert ? 'Edit Alert' : 'Create Price Alert'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Token Symbol</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.tokenSymbol}
                  onChangeText={text =>
                    setFormData({
                      ...formData,
                      tokenSymbol: text.toUpperCase(),
                    })
                  }
                  placeholder="e.g. BTC, ETH, SOL"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  editable={!editingAlert} // Don't allow editing token symbol
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Alert Condition</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      formData.condition === 'above' &&
                        styles.pickerOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, condition: 'above' })
                    }
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.condition === 'above' &&
                          styles.pickerOptionTextSelected,
                      ]}
                    >
                      Above
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      formData.condition === 'below' &&
                        styles.pickerOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, condition: 'below' })
                    }
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.condition === 'below' &&
                          styles.pickerOptionTextSelected,
                      ]}
                    >
                      Below
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Target Price (USD)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.targetPrice.toString()}
                  onChangeText={text =>
                    setFormData({
                      ...formData,
                      targetPrice: parseFloat(text) || 0,
                    })
                  }
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Network</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      formData.network === 'ethereum' &&
                        styles.pickerOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, network: 'ethereum' })
                    }
                    disabled={!!editingAlert} // Don't allow editing network
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.network === 'ethereum' &&
                          styles.pickerOptionTextSelected,
                      ]}
                    >
                      ⬢ Ethereum
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      formData.network === 'solana' &&
                        styles.pickerOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, network: 'solana' })
                    }
                    disabled={!!editingAlert} // Don't allow editing network
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.network === 'solana' &&
                          styles.pickerOptionTextSelected,
                      ]}
                    >
                      🪐 Solana
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingAlert ? handleUpdateAlert : handleCreateAlert}
              >
                <Text style={styles.submitButtonText}>
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default PriceAlertsScreen;
