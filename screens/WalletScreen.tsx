import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

export default function WalletScreen({ userId, onBack }: {
  userId: string;
  onBack: () => void;
}) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, txRes] = await Promise.all([
        fetch(API_URL + '/api/wallet/balance/' + userId),
        fetch(API_URL + '/api/wallet/transactions/' + userId)
      ]);
      const balData = await balRes.json();
      const txData = await txRes.json();
      setBalance(balData.balance || 0);
      setTransactions(txData.transactions || []);
    } catch (err) {}
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Wallet</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balance}>{balance.toFixed(2)} EUR</Text>
        <TouchableOpacity style={styles.withdrawBtn}>
          <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transaction History</Text>

      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No transactions yet.</Text>
          <Text style={styles.emptySubtext}>Play a challenge to earn your first reward!</Text>
        </View>
      ) : (
        transactions.map((tx, i) => (
          <View key={i} style={styles.txRow}>
            <View>
              <Text style={styles.txType}>{tx.type === 'prize' ? '🏆 Prize' : '💸 Withdrawal'}</Text>
              <Text style={styles.txDate}>{new Date(tx.createdAt?._seconds * 1000).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'withdrawal' && styles.txNegative]}>
              {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount?.toFixed(2)} EUR
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  center: { flex: 1, backgroundColor: '#0F0A1A', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 32 },
  back: { color: '#7C3AED', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  balanceCard: { backgroundColor: '#1F1535', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 32 },
  balanceLabel: { color: '#6B7280', fontSize: 14, marginBottom: 8 },
  balance: { fontSize: 48, fontWeight: 'bold', color: '#FBBF24', marginBottom: 24 },
  withdrawBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  withdrawBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#6B7280', fontSize: 16, marginBottom: 8 },
  emptySubtext: { color: '#4B5563', fontSize: 14 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F1535', borderRadius: 12, padding: 16, marginBottom: 10 },
  txType: { color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  txDate: { color: '#6B7280', fontSize: 13 },
  txAmount: { color: '#22C55E', fontSize: 16, fontWeight: 'bold' },
  txNegative: { color: '#EF4444' }
});