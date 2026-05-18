import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

const CATEGORIES = ['Geografia', 'Ciencia', 'Historia', 'Deportes'];
const DIFFICULTIES = ['basico', 'medio', 'avanzado', 'experto'];
const ENTRY_FEES = [0.50, 1.00, 2.50, 5.00, 10.00];

export default function HomeScreen({ userId, onStartGame, onGoToWallet, onTopUp, onGoToProfile }: {
  userId: string;
  onStartGame: (sessionId: string, questions: any[], difficulty: string) => void;
  onGoToWallet: () => void;
  onTopUp: () => void;
  onGoToProfile: () => void;
}) {
  const [balance, setBalance] = useState(0);
  const [category, setCategory] = useState('Geografia');
  const [difficulty, setDifficulty] = useState('basico');
  const [entryFee, setEntryFee] = useState(1.00);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

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
    if (balance < entryFee) {
      setError(`Saldo insuficiente. Necesitas ${entryFee.toFixed(2)} EUR. Recarga tu wallet.`);
      return;
    }
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
        onStartGame(data.sessionId, data.questions, difficulty);
      } else {
        setError('Error generating questions. Try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Modal visible={showWelcome} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🧠</Text>
            <Text style={styles.modalTitle}>Juega con{'\n'}Dinero Real</Text>
            <Text style={styles.modalSubtitle}>Demuestra tus conocimientos y gana premios reales en cada reto</Text>
            <View style={styles.modalFeatures}>
              <Text style={styles.modalFeature}>🏆 Gana dinero real</Text>
              <Text style={styles.modalFeature}>⚡ Premios instantáneos</Text>
              <Text style={styles.modalFeature}>🔒 100% seguro y verificado</Text>
            </View>
            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={() => { setShowWelcome(false); onTopUp(); }}
            >
              <Text style={styles.modalBtnPrimaryText}>💳 Añadir Créditos y Jugar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => setShowWelcome(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Ya tengo créditos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        {/* HEADER - Fila 1: Logo + Perfil */}
        <View style={styles.headerRow1}>
          <Text style={styles.title}>🧠 SkillPlay</Text>
          <TouchableOpacity style={styles.profileBtn} onPress={onGoToProfile}>
            <Text style={styles.profileBtnText}>👤 Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* HEADER - Fila 2: Saldo + Créditos */}
        <View style={styles.headerRow2}>
          <TouchableOpacity style={styles.walletBtn} onPress={onGoToWallet}>
            <Text style={styles.walletText}>💰 {balance.toFixed(2)} EUR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCreditsBtn} onPress={onTopUp}>
            <Text style={styles.addCreditsText}>+ Añadir Créditos</Text>
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

        <View style={styles.balanceInfo}>
          <Text style={styles.balanceInfoText}>Tu saldo: <Text style={styles.balanceInfoAmount}>{balance.toFixed(2)} EUR</Text></Text>
          {balance < entryFee && (
            <TouchableOpacity onPress={onTopUp}>
              <Text style={styles.addCreditsLink}>+ Añadir créditos</Text>
            </TouchableOpacity>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.startBtn, balance < entryFee && styles.startBtnDisabled]}
          onPress={handleStartGame}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.startBtnText}>
              {balance < entryFee ? '+ Añadir créditos para jugar' : 'Start Challenge'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  headerRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 12 },
  headerRow2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#7C3AED' },
  profileBtn: { backgroundColor: '#1F1535', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  walletBtn: { backgroundColor: '#1F1535', padding: 10, borderRadius: 10, flex: 1 },
  walletText: { color: '#FBBF24', fontWeight: 'bold', textAlign: 'center' },
  addCreditsBtn: { backgroundColor: '#22C55E', padding: 10, borderRadius: 10, flex: 1 },
  addCreditsText: { color: 'white', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 12, marginTop: 20 },
  row: { marginBottom: 8 },
  chip: { backgroundColor: '#1F1535', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#374151' },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { color: '#6B7280', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  balanceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F1535', borderRadius: 12, padding: 14, marginTop: 20 },
  balanceInfoText: { color: '#9CA3AF', fontSize: 14 },
  balanceInfoAmount: { color: '#FBBF24', fontWeight: 'bold' },
  addCreditsLink: { color: '#22C55E', fontWeight: 'bold', fontSize: 14 },
  error: { color: '#EF4444', textAlign: 'center', marginTop: 16 },
  startBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  startBtnDisabled: { backgroundColor: '#FF6B35' },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1F1535', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center' },
  modalEmoji: { fontSize: 64, marginBottom: 16 },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  modalSubtitle: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  modalFeatures: { width: '100%', marginBottom: 28, gap: 12 },
  modalFeature: { color: '#D1FAE5', fontSize: 16, fontWeight: '600' },
  modalBtnPrimary: { backgroundColor: '#22C55E', borderRadius: 14, padding: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  modalBtnPrimaryText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalBtnSecondary: { padding: 12 },
  modalBtnSecondaryText: { color: '#6B7280', fontSize: 15 }
});