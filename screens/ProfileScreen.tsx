import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

const API_URL = 'https://skillplay-production.up.railway.app';

export default function ProfileScreen({ userId, onBack, onTopUp, onWithdraw }: {
  userId: string;
  onBack: () => void;
  onTopUp: () => void;
  onWithdraw: () => void;
}) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, balRes] = await Promise.all([
        fetch(API_URL + '/api/auth/profile/' + userId),
        fetch(API_URL + '/api/wallet/balance/' + userId)
      ]);
      const profileData = await profileRes.json();
      const balData = await balRes.json();
      setProfile({ ...profileData, ...balData });
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

  const kycVerified = profile?.kycStatus === 'verified';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile_title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{profile?.username || userId}</Text>
        <Text style={styles.email}>{profile?.email || ''}</Text>
        <View style={[styles.kycBadge, kycVerified && styles.kycBadgeVerified]}>
          <Text style={[styles.kycBadgeText, kycVerified && styles.kycBadgeTextVerified]}>
            {kycVerified ? t('profile_verified') : t('profile_not_verified')}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValueGold}>{(profile?.balance || 0).toFixed(2)} €</Text>
          <Text style={styles.statLabel}>{t('profile_balance')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueWhite}>{profile?.gamesPlayed || 0}</Text>
          <Text style={styles.statLabel}>{t('profile_games')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueGold}>{(profile?.totalEarned || 0).toFixed(2)} €</Text>
          <Text style={styles.statLabel}>{t('profile_earned')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueRed}>{(profile?.totalWithdrawn || 0).toFixed(2)} €</Text>
          <Text style={styles.statLabel}>{t('profile_withdrawn')}</Text>
        </View>
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>{t('profile_level')}</Text>
        <Text style={styles.levelValue}>
          {profile?.accountLevel === 'premium' ? '👑 Premium' :
           profile?.accountLevel === 'advanced' ? '⭐ Advanced' :
           profile?.accountLevel === 'basic' ? '✅ Basic' : '🆕 New'}
        </Text>
        <Text style={styles.levelLimit}>{t('profile_daily_limit', { limit: profile?.dailyLimit || 50 })}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.addCreditsBtn} onPress={onTopUp}>
          <Text style={styles.actionBtnText}>{t('profile_add_credits')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.withdrawBtn, !kycVerified && styles.actionBtnDisabled]}
          onPress={onWithdraw}
          disabled={!kycVerified}
        >
          <Text style={styles.actionBtnText}>{t('profile_withdraw')}</Text>
        </TouchableOpacity>
      </View>

      {!kycVerified && (
        <View style={styles.kycWarning}>
          <Text style={styles.kycWarningText}>{t('profile_kyc_warning')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24 },
  center: { flex: 1, backgroundColor: '#0F0A1A', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  back: { color: '#7C3AED', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  username: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  kycBadge: { backgroundColor: '#1F1535', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#374151' },
  kycBadgeVerified: { backgroundColor: '#2D1B69', borderColor: '#7C3AED' },
  kycBadgeText: { color: '#9CA3AF', fontWeight: '600', fontSize: 13 },
  kycBadgeTextVerified: { color: '#7C3AED' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { backgroundColor: '#1F1535', borderRadius: 16, padding: 20, flex: 1, minWidth: '45%', alignItems: 'center' },
  statValueGold: { fontSize: 24, fontWeight: 'bold', color: '#FBBF24', marginBottom: 4, textShadowColor: '#FBBF24', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  statValueWhite: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  statValueRed: { fontSize: 24, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 },
  statLabel: { color: '#6B7280', fontSize: 13 },
  levelCard: { backgroundColor: '#1F1535', borderRadius: 16, padding: 20, marginBottom: 24, alignItems: 'center' },
  levelLabel: { color: '#6B7280', fontSize: 13, marginBottom: 8 },
  levelValue: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  levelLimit: { color: '#9CA3AF', fontSize: 13 },
  actions: { gap: 12, marginBottom: 16 },
  addCreditsBtn: { backgroundColor: '#22C55E', borderRadius: 12, padding: 16, alignItems: 'center' },
  withdrawBtn: { backgroundColor: '#EF4444', borderRadius: 12, padding: 16, alignItems: 'center' },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  kycWarning: { backgroundColor: '#1c1107', borderRadius: 12, padding: 14, marginBottom: 40 },
  kycWarningText: { color: '#FCD34D', fontSize: 13, textAlign: 'center' }
});