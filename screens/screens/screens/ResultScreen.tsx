import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ResultScreen({ result, onPlayAgain, onGoHome }: {
  result: any;
  onPlayAgain: () => void;
  onGoHome: () => void;
}) {
  const isError = result?.error;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{isError ? '❌' : result?.prize > 0 ? '🏆' : '📚'}</Text>
      <Text style={styles.title}>
        {isError ? 'Something went wrong' : result?.prize > 0 ? 'Challenge Complete!' : 'Keep Practicing!'}
      </Text>

      {!isError && (
        <>
          <View style={styles.card}>
            <Text style={styles.prizeLabel}>Your Reward</Text>
            <Text style={styles.prize}>{result?.prize?.toFixed(2)} EUR</Text>
          </View>

          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Breakdown</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Accuracy</Text>
              <Text style={styles.rowValue}>{result?.accuracy}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Base Prize</Text>
              <Text style={styles.rowValue}>{result?.breakdown?.base?.toFixed(2)} EUR</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Speed Bonus</Text>
              <Text style={styles.rowValue}>+{result?.breakdown?.speed?.toFixed(2)} EUR</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Streak Bonus</Text>
              <Text style={styles.rowValue}>+{result?.breakdown?.streak?.toFixed(2)} EUR</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Penalty</Text>
              <Text style={styles.rowValueRed}>-{result?.breakdown?.penalty?.toFixed(2)} EUR</Text>
            </View>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.primaryBtn} onPress={onPlayAgain}>
        <Text style={styles.primaryBtnText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onGoHome}>
        <Text style={styles.secondaryBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 32, textAlign: 'center' },
  card: { backgroundColor: '#1F1535', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', marginBottom: 24 },
  prizeLabel: { color: '#6B7280', fontSize: 14, marginBottom: 8 },
  prize: { fontSize: 48, fontWeight: 'bold', color: '#FBBF24' },
  breakdown: { backgroundColor: '#1F1535', borderRadius: 16, padding: 20, width: '100%', marginBottom: 32 },
  breakdownTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#D1D5DB', fontSize: 15 },
  rowValue: { color: '#22C55E', fontSize: 15, fontWeight: '600' },
  rowValueRed: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  primaryBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  secondaryBtnText: { color: '#6B7280', fontSize: 16 }
});