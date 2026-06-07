import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const API_URL = 'https://skillplay-production.up.railway.app';

const CATEGORIES = ['Geografia', 'Ciencia', 'Historia', 'Deportes'];
const DIFFICULTIES = ['basico', 'medio', 'avanzado', 'experto'];
const ENTRY_FEES = [0.50, 1.00, 2.50, 5.00, 10.00];

export default function HomeScreen({ userId, onStartGame, onGoToWallet, onTopUp, onGoToProfile }: {
  userId: string;
  onStartGame: (sessionId: string, questions: any[], difficulty: string, fullQuestions?: any[]) => void;
  onGoToWallet: () => void;
  onTopUp: () => void;
  onGoToProfile: () => void;
}) {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [freeGamesLeft, setFreeGamesLeft] = useState(0);
  const [nextRefillAt, setNextRefillAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');
  const [category, setCategory] = useState('Geografia');
  const [difficulty, setDifficulty] = useState('basico');
  const [entryFee, setEntryFee] = useState(1.00);
  const [loading, setLoading] = useState(false);
  const [loadingFree, setLoadingFree] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  const isFreeGame = freeGamesLeft > 0;

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    if (!nextRefillAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextRefillAt.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('');
        fetchBalance();
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRefillAt]);

  const fetchBalance = async () => {
    try {
      const res = await fetch(API_URL + '/api/wallet/balance/' + userId);
      const data = await res.json();
      setBalance(data.balance || 0);
      setFreeGamesLeft(data.freeGamesLeft ?? 15);
      if (data.nextRefillAt) {
        setNextRefillAt(new Date(data.nextRefillAt));
      }
    } catch (err) {}
  };

  const handleStartGame = async (useFreeGame: boolean) => {
    if (!useFreeGame && balance < entryFee) {
      setError(t('home_insufficient', { amount: entryFee.toFixed(2) }));
      return;
    }
    if (useFreeGame) setLoadingFree(true);
    else setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL + '/api/game/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          difficulty,
          entryFee: useFreeGame ? 0 : entryFee,
          userId,
          isFreeGame: useFreeGame
        })
      });
      const data = await res.json();
      if (data.sessionId) {
        setFreeGamesLeft(data.freeGamesLeft ?? freeGamesLeft);
        if (data.nextRefillAt) setNextRefillAt(new Date(data.nextRefillAt));
        onStartGame(data.sessionId, data.questions, difficulty, data.fullQuestions);
      } else {
        setError(data.error || t('error_connection'));
      }
    } catch (err) {
      setError(t('error_connection'));
    }
    setLoading(false);
    setLoadingFree(false);
  };

  return (
    <>
      <Modal visible={showWelcome} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image source={require('../assets/icon.png')} style={styles.modalLogo} resizeMode="contain" />
            <Text style={styles.modalTitle}>{t('welcome_title')}</Text>
            <Text style={styles.modalSubtitle}>{t('welcome_subtitle')}</Text>
            <View style={styles.modalFeatures}>
              <Text style={styles.modalFeature}>🎮 {t('welcome_feature1')}</Text>
              <Text style={styles.modalFeature}>🎓 15 partidas gratis para empezar</Text>
              <Text style={styles.modalFeature}>💰 {t('welcome_feature3')}</Text>
            </View>
            <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => { setShowWelcome(false); onTopUp(); }}>
              <Text style={styles.modalBtnPrimaryText}>{t('welcome_btn_primary')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowWelcome(false)}>
              <Text style={styles.modalBtnSecondaryText}>{t('welcome_btn_secondary')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        <View style={styles.headerRow1}>
          <TouchableOpacity style={styles.logoRow} onPress={onGoToProfile}>
            <Image source={require('../assets/icon.png')} style={styles.logoImg} resizeMode="contain" />
            <Text style={styles.title}>{t('home_title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={onGoToProfile}>
            <Text style={styles.profileBtnText}>{t('home_profile')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow2}>
          <TouchableOpacity style={styles.walletBtn} onPress={onGoToWallet}>
            <Text style={styles.walletText}>💰 <Text style={styles.balanceGlow}>{balance.toFixed(2)} EUR</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCreditsBtn} onPress={onTopUp}>
            <Text style={styles.addCreditsText}>{t('home_add_credits')}</Text>
          </TouchableOpacity>
        </View>

        {isFreeGame ? (
          <View style={styles.freeGameBanner}>
            <Text style={styles.freeGameEmoji}>🎁</Text>
            <View>
              <Text style={styles.freeGameTitle}>¡Partida Gratis disponible!</Text>
              <Text style={styles.freeGameSubtitle}>Te quedan {freeGamesLeft} partidas gratis</Text>
            </View>
          </View>
        ) : countdown ? (
          <View style={styles.countdownBanner}>
            <Text style={styles.countdownEmoji}>⏳</Text>
            <View>
              <Text style={styles.countdownTitle}>Próximas 5 partidas gratis en:</Text>
              <Text style={styles.countdownTimer}>{countdown}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{t('home_category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('home_difficulty')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {DIFFICULTIES.map(diff => (
            <TouchableOpacity key={diff} style={[styles.chip, difficulty === diff && styles.chipActive]} onPress={() => setDifficulty(diff)}>
              <Text style={[styles.chipText, difficulty === diff && styles.chipTextActive]}>{diff}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('home_entry_fee')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {ENTRY_FEES.map(fee => (
            <TouchableOpacity key={fee} style={[styles.chip, entryFee === fee && styles.chipActive]} onPress={() => setEntryFee(fee)}>
              <Text style={[styles.chipText, entryFee === fee && styles.chipTextActive]}>{fee.toFixed(2)} EUR</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.balanceInfo}>
          <Text style={styles.balanceInfoText}>{t('home_balance')}: <Text style={styles.balanceInfoAmount}>{balance.toFixed(2)} EUR</Text></Text>
          {balance < entryFee && (
            <TouchableOpacity onPress={onTopUp}>
              <Text style={styles.addCreditsLink}>{t('home_add_credits')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.startBtn, balance < entryFee && styles.startBtnDisabled]}
          onPress={() => handleStartGame(false)}
          disabled={loading || loadingFree || balance < entryFee}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.startBtnText}>
              {balance < entryFee ? t('home_add_credits_to_play') : t('home_start')}
            </Text>
          )}
        </TouchableOpacity>

        {isFreeGame && (
          <TouchableOpacity
            style={styles.freeBtn}
            onPress={() => handleStartGame(true)}
            disabled={loading || loadingFree}
          >
            {loadingFree ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.startBtnText}>🎁 Jugar Gratis ({freeGamesLeft} restantes)</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  headerRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 12 },
  headerRow2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 8 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoImg: { width: 36, height: 36, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#7C3AED' },
  profileBtn: { backgroundColor: '#1F1535', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  profileBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  walletBtn: { backgroundColor: '#1F1535', padding: 10, borderRadius: 10, flex: 1 },
  walletText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  balanceGlow: { color: '#FBBF24', fontWeight: 'bold', textShadowColor: '#FBBF24', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
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
  balanceInfoAmount: { color: '#FBBF24', fontWeight: 'bold', textShadowColor: '#FBBF24', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  addCreditsLink: { color: '#22C55E', fontWeight: 'bold', fontSize: 14 },
  error: { color: '#EF4444', textAlign: 'center', marginTop: 16 },
  startBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 32, marginBottom: 12 },
  startBtnDisabled: { backgroundColor: '#4C1D95', opacity: 0.6 },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  freeBtn: { backgroundColor: '#22C55E', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 40 },
  freeGameBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#064E3B', borderRadius: 12, padding: 16, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: '#22C55E' },
  freeGameEmoji: { fontSize: 32 },
  freeGameTitle: { color: '#22C55E', fontWeight: 'bold', fontSize: 16 },
  freeGameSubtitle: { color: '#6EE7B7', fontSize: 13 },
  countdownBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1535', borderRadius: 12, padding: 16, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: '#374151' },
  countdownEmoji: { fontSize: 32 },
  countdownTitle: { color: '#9CA3AF', fontSize: 13, marginBottom: 4 },
  countdownTimer: { color: '#FBBF24', fontWeight: 'bold', fontSize: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1F1535', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center' },
  modalLogo: { width: 100, height: 100, marginBottom: 16, borderRadius: 20 },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  modalSubtitle: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  modalFeatures: { width: '100%', marginBottom: 28, gap: 12 },
  modalFeature: { color: '#D1FAE5', fontSize: 16, fontWeight: '600' },
  modalBtnPrimary: { backgroundColor: '#22C55E', borderRadius: 14, padding: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  modalBtnPrimaryText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalBtnSecondary: { padding: 12 },
  modalBtnSecondaryText: { color: '#6B7280', fontSize: 15 }
});