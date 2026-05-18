import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useTranslation } from 'react-i18next';

const API_URL = 'https://skillplay-production.up.railway.app';

const AMOUNTS = [5, 10, 20, 50, 100];

export default function TopUpScreen({ userId, onBack, onSuccess }: {
  userId: string;
  onBack: () => void;
  onSuccess: (newBalance: number) => void;
}) {
  const { t } = useTranslation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleTopUp = async () => {
    if (!selectedAmount) {
      Alert.alert(t('error'), t('topup_btn_select'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL + '/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: selectedAmount })
      });
      const data = await res.json();

      if (!data.clientSecret) {
        Alert.alert(t('error'), data.error || t('error_connection'));
        setLoading(false);
        return;
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'SkillPlay',
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: { name: userId },
        style: 'alwaysDark'
      });

      if (initError) {
        Alert.alert(t('error'), initError.message);
        setLoading(false);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert(t('error'), paymentError.message);
        }
        setLoading(false);
        return;
      }

      const confirmRes = await fetch(API_URL + '/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentIntentId: data.clientSecret.split('_secret_')[0]
        })
      });
      const confirmData = await confirmRes.json();

      if (confirmData.success) {
        Alert.alert(
          t('topup_success_title'),
          t('topup_success_msg', { amount: selectedAmount.toFixed(2) }),
          [{ text: t('ok'), onPress: () => onSuccess(confirmData.newBalance) }]
        );
      } else {
        Alert.alert(t('error'), confirmData.error || t('error_connection'));
      }

    } catch (err) {
      Alert.alert(t('error'), t('error_connection'));
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('topup_title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.subtitle}>{t('topup_subtitle')}</Text>

      <View style={styles.amountsGrid}>
        {AMOUNTS.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.amountBtn, selectedAmount === amount && styles.amountBtnSelected]}
            onPress={() => setSelectedAmount(amount)}
          >
            <Text style={[styles.amountText, selectedAmount === amount && styles.amountTextSelected]}>
              {amount} EUR
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>{t('topup_info1')}</Text>
        <Text style={styles.infoText}>{t('topup_info2')}</Text>
        <Text style={styles.infoText}>{t('topup_info3')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, (!selectedAmount || loading) && styles.btnDisabled]}
        onPress={handleTopUp}
        disabled={!selectedAmount || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.btnText}>
            {selectedAmount ? t('topup_btn', { amount: selectedAmount.toFixed(2) }) : t('topup_btn_select')}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  back: { color: '#7C3AED', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32 },
  amountBtn: { backgroundColor: '#1F1535', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: '#374151', minWidth: 100, alignItems: 'center' },
  amountBtnSelected: { borderColor: '#7C3AED', backgroundColor: '#2D1B69' },
  amountText: { color: '#9CA3AF', fontSize: 18, fontWeight: 'bold' },
  amountTextSelected: { color: '#7C3AED' },
  infoBox: { backgroundColor: '#1F1535', borderRadius: 12, padding: 16, marginBottom: 32, gap: 8 },
  infoText: { color: '#9CA3AF', fontSize: 13 },
  btn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 40 },
  btnDisabled: { backgroundColor: '#374151' },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});