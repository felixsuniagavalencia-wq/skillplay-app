import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

const AMOUNTS = [5, 10, 20, 50, 100];

export default function TopUpScreen({ userId, onBack, onSuccess }: {
  userId: string;
  onBack: () => void;
  onSuccess: (newBalance: number) => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleTopUp = async () => {
    if (!selectedAmount) {
      Alert.alert('Error', 'Selecciona un importe');
      return;
    }

    setLoading(true);
    try {
      // 1. Crear Payment Intent en el backend
      const res = await fetch(API_URL + '/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: selectedAmount })
      });
      const data = await res.json();

      if (!data.clientSecret) {
        Alert.alert('Error', data.error || 'Error creando pago');
        setLoading(false);
        return;
      }

      // 2. Inicializar Payment Sheet de Stripe
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'SkillPlay',
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: { name: userId },
        style: 'alwaysDark'
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        setLoading(false);
        return;
      }

      // 3. Mostrar formulario de pago
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Error', paymentError.message);
        }
        setLoading(false);
        return;
      }

      // 4. Confirmar en el backend y acreditar saldo
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
          '✅ Recarga exitosa',
          `Se han añadido ${selectedAmount.toFixed(2)} EUR a tu wallet.`,
          [{ text: 'OK', onPress: () => onSuccess(confirmData.newBalance) }]
        );
      } else {
        Alert.alert('Error', confirmData.error || 'Error confirmando pago');
      }

    } catch (err) {
      Alert.alert('Error', 'Error conectando al servidor');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Credits</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.subtitle}>Select amount to add to your wallet</Text>

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
        <Text style={styles.infoText}>💳 Pago seguro con Stripe</Text>
        <Text style={styles.infoText}>⚡ Saldo disponible inmediatamente</Text>
        <Text style={styles.infoText}>🔒 Datos bancarios nunca almacenados</Text>
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
            {selectedAmount ? `Add ${selectedAmount} EUR` : 'Select an amount'}
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