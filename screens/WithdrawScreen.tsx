import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

export default function WithdrawScreen({ userId, balance, onBack }: {
  userId: string;
  balance: number;
  onBack: () => void;
}) {
  const [accountHolder, setAccountHolder] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCountry, setBankCountry] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const validateIban = (val: string) => {
    const clean = val.replace(/\s/g, '').toUpperCase();
    return clean.length >= 15 && clean.length <= 34;
  };

  const validateBic = (val: string) => {
    const clean = val.replace(/\s/g, '').toUpperCase();
    return clean.length >= 8 && clean.length <= 11;
  };

  const handleWithdraw = async () => {
    if (!accountHolder.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del titular de la cuenta');
      return;
    }
    if (!validateIban(iban)) {
      Alert.alert('Error', 'Ingresa un IBAN válido (15-34 caracteres)');
      return;
    }
    if (!validateBic(bic)) {
      Alert.alert('Error', 'Ingresa un BIC/SWIFT válido (8-11 caracteres)');
      return;
    }
    if (!bankName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del banco');
      return;
    }
    if (!bankCountry.trim()) {
      Alert.alert('Error', 'Ingresa el país del banco');
      return;
    }
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 5) {
      Alert.alert('Error', 'El importe mínimo de retiro es 5.00 EUR');
      return;
    }
    if (amountNum > balance) {
      Alert.alert('Error', 'El importe supera tu saldo disponible');
      return;
    }

    Alert.alert(
      'Confirmar retiro',
      `¿Confirmas el retiro de ${amountNum.toFixed(2)} EUR?\n\nTitular: ${accountHolder}\nIBAN: ${iban.replace(/\s/g, '').toUpperCase()}\nBIC: ${bic.replace(/\s/g, '').toUpperCase()}\nBanco: ${bankName}\nPaís: ${bankCountry}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => submitWithdraw(amountNum) }
      ]
    );
  };

  const submitWithdraw = async (amountNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: amountNum,
          iban: iban.replace(/\s/g, '').toUpperCase(),
          bic: bic.replace(/\s/g, '').toUpperCase(),
          accountHolder: accountHolder.trim(),
          bankName: bankName.trim(),
          bankCountry: bankCountry.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert(
          '✅ Retiro solicitado',
          `Tu retiro de ${amountNum.toFixed(2)} EUR ha sido registrado.\n\nSerá procesado en 24-48 horas hábiles.\n\nReferencia: ${data.reference || 'SP-' + Date.now()}`,
          [{ text: 'OK', onPress: onBack }]
        );
      } else {
        Alert.alert('Error', data.error || 'No se pudo procesar el retiro');
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
        <Text style={styles.title}>Withdraw Funds</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balance}>{balance.toFixed(2)} EUR</Text>
      </View>

      <View style={styles.form}>

        <Text style={styles.sectionHeader}>👤 Datos del Titular</Text>

        <Text style={styles.label}>Nombre completo del titular</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre como aparece en la cuenta bancaria"
          placeholderTextColor="#6B7280"
          value={accountHolder}
          onChangeText={setAccountHolder}
          autoCapitalize="words"
        />

        <Text style={styles.sectionHeader}>🏦 Datos Bancarios</Text>

        <Text style={styles.label}>IBAN</Text>
        <TextInput
          style={styles.input}
          placeholder="ES12 3456 7890 1234 5678 9012"
          placeholderTextColor="#6B7280"
          value={iban}
          onChangeText={setIban}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text style={styles.hint}>International Bank Account Number</Text>

        <Text style={styles.label}>BIC / SWIFT</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXXXXXX o XXXXXXXXXXX"
          placeholderTextColor="#6B7280"
          value={bic}
          onChangeText={setBic}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text style={styles.hint}>Bank Identifier Code (8 u 11 caracteres)</Text>

        <Text style={styles.label}>Nombre del banco</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Banco Santander, BBVA, Deutsche Bank"
          placeholderTextColor="#6B7280"
          value={bankName}
          onChangeText={setBankName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>País del banco</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: España, Venezuela, México, USA"
          placeholderTextColor="#6B7280"
          value={bankCountry}
          onChangeText={setBankCountry}
          autoCapitalize="words"
        />

        <Text style={styles.sectionHeader}>💶 Importe</Text>

        <Text style={styles.label}>Cantidad a retirar (EUR)</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 5.00 EUR"
          placeholderTextColor="#6B7280"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>⏱ Procesamiento: 24-48 horas hábiles</Text>
          <Text style={styles.infoText}>🌍 Transferencia internacional SWIFT/SEPA</Text>
          <Text style={styles.infoText}>📋 Verificación KYC requerida</Text>
          <Text style={styles.infoText}>💶 Importe mínimo: 5.00 EUR</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleWithdraw}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Solicitar Retiro</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  back: { color: '#7C3AED', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  balanceCard: { backgroundColor: '#1F1535', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: '#6B7280', fontSize: 14, marginBottom: 8 },
  balance: { fontSize: 40, fontWeight: 'bold', color: '#FBBF24' },
  form: { gap: 4 },
  sectionHeader: { color: '#7C3AED', fontSize: 15, fontWeight: 'bold', marginTop: 20, marginBottom: 4 },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#1F1535', borderRadius: 12, padding: 16, color: 'white', fontSize: 15, borderWidth: 1, borderColor: '#374151' },
  hint: { color: '#6B7280', fontSize: 11, marginTop: 3 },
  infoBox: { backgroundColor: '#1F1535', borderRadius: 12, padding: 16, marginTop: 20, gap: 8 },
  infoText: { color: '#9CA3AF', fontSize: 13 },
  btn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  btnDisabled: { backgroundColor: '#374151' },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});