import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

const CATEGORIES = ['Geografia', 'Ciencia', 'Historia', 'Deportes'];
const DIFFICULTIES = ['basico', 'medio', 'avanzado', 'experto'];
const ENTRY_FEES = [0.50, 1.00, 2.50, 5.00, 10.00];

export default function HomeScreen({ userId, onStartGame, onGoToWallet }: {
  userId: string;
  onStartGame: (sessionId: string, questions: any[]) => void;
  onGoToWallet: () => void;
}) {
  const [balance, setBalance] = useState(0);
  const [category, setCategory] = useState('Geografia');
  const [difficulty, setDifficulty] = useState('basico');
  const [entryFee, setEntryFee] = useState(1.00);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch(API_URL + '/api/wallet/balance/' + userId);
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (err) {}
  };

  const handleStartGame = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL + '/api/game/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, difficulty, entryFee, userId })
      });
      const data = await res.json();
      if (data.sessionId) {
        onStartGame(data.sessionId, data.questions);
      } else {
        setError('Error generating questions. Try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SkillPlay</Text>
        <TouchableOpacity style={styles.walletBtn} onPress={onGoToWallet}>
          <Text style={styles.walletText}>💰 {balance.toFixed(2)} EUR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}>
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Difficulty</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {DIFFICULTIES.map(diff => (
          <TouchableOpacity
            key={diff}
            style={[styles.chip, difficulty === diff && styles.chipActive]}
            onPress={() => setDifficulty(diff)}>
            <Text style={[styles.chipText, difficulty === diff && styles.chipTextActive]}>{diff}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Entry Fee</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {ENTRY_FEES.map(fee => (
          <TouchableOpacity
            key={fee}
            style={[styles.chip, entryFee === fee && styles.chipActive]}
            onPress={() => setEntryFee(fee)}>
            <Text style={[styles.chipText, entryFee === fee && styles.chipTextActive]}>{fee.toFixed(2)} EUR</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.startBtn} onPress={handleStartGame} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.startBtnText}>Start Challenge</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#7C3AED' },
  walletBtn: { backgroundColor: '#1F1535', padding: 10, borderRadius: 10 },
  walletText: { color: '#FBBF24', fontWeight: 'bold' },
  sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 12, marginTop: 20 },
  row: { marginBottom: 8 },
  chip: { backgroundColor: '#1F1535', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#374151' },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { color: '#6B7280', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  error: { color: '#EF4444', textAlign: 'center', marginTop: 16 },
  startBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});