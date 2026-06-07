import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ResultScreen({ result, onPlayAgain, onGoHome }: {
  result: any;
  onPlayAgain: () => void;
  onGoHome: () => void;
}) {
  const isError = result?.error;
  const answeredQuestions = result?.answeredQuestions || [];
  const isFreeGame = result?.isFreeGame;
  const freePoints = result?.freePoints || 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>
        {isError ? '❌' : isFreeGame ? '🎓' : result?.prize > 0 ? '🏆' : '📚'}
      </Text>
      <Text style={styles.title}>
        {isError ? 'Something went wrong' : isFreeGame ? '¡Práctica Completada!' : result?.prize > 0 ? 'Challenge Complete!' : 'Keep Practicing!'}
      </Text>

      {!isError && (
        <>
          {isFreeGame ? (
            // Pantalla de partida gratis — muestra puntos
            <View style={styles.freeCard}>
              <Text style={styles.freeCardLabel}>Puntos Ganados</Text>
              <Text style={styles.freePoints}>+{freePoints} pts</Text>
              <Text style={styles.freeCardSub}>Precisión: {result?.accuracy}%</Text>
              <View style={styles.freePointsBreakdown}>
                <Text style={styles.freePointRow}>✅ Respuestas correctas: +{result?.answeredQuestions?.filter((q: any) => q.isCorrect).length || 0} pts</Text>
                {freePoints > (result?.answeredQuestions?.filter((q: any) => q.isCorrect).length || 0) && (
                  <Text style={styles.freePointRow}>⚡ Bonus velocidad/perfecto: +{freePoints - (result?.answeredQuestions?.filter((q: any) => q.isCorrect).length || 0)} pts</Text>
                )}
              </View>
              <View style={styles.freePromoBox}>
                <Text style={styles.freePromoText}>💰 ¡Juega con dinero real para ganar premios en EUR!</Text>
              </View>
            </View>
          ) : (
            // Pantalla de partida de pago — muestra premio
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
                {result?.epicPrize > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>⚡ Epic Bonus</Text>
                    <Text style={styles.rowValueGold}>+{result?.epicPrize?.toFixed(2)} EUR</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {answeredQuestions.length > 0 && (
            <View style={styles.questionsReview}>
              <Text style={styles.breakdownTitle}>Question Review</Text>
              {answeredQuestions.map((q: any, index: number) => (
                <View key={index} style={styles.questionItem}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionEmoji}>{q.isCorrect ? '✅' : '❌'}</Text>
                    <Text style={styles.questionText}>Q{index + 1}: {q.question}</Text>
                  </View>
                  {!q.isCorrect && (
                    <>
                      <Text style={styles.yourAnswer}>Your answer: <Text style={styles.wrongAnswer}>{q.selectedOption}</Text></Text>
                      <Text style={styles.correctAnswerText}>Correct: <Text style={styles.correctAnswer}>{q.correctOption}</Text></Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={styles.primaryBtn} onPress={onPlayAgain}>
        <Text style={styles.primaryBtnText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onGoHome}>
        <Text style={styles.secondaryBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0F0A1A', padding: 24, alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 32, textAlign: 'center' },
  card: { backgroundColor: '#1F1535', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', marginBottom: 24 },
  prizeLabel: { color: '#6B7280', fontSize: 14, marginBottom: 8 },
  prize: { fontSize: 48, fontWeight: 'bold', color: '#FBBF24' },
  freeCard: { backgroundColor: '#064E3B', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', marginBottom: 24, borderWidth: 1, borderColor: '#22C55E' },
  freeCardLabel: { color: '#6EE7B7', fontSize: 14, marginBottom: 8 },
  freePoints: { fontSize: 56, fontWeight: 'bold', color: '#22C55E', marginBottom: 8 },
  freeCardSub: { color: '#6EE7B7', fontSize: 14, marginBottom: 16 },
  freePointsBreakdown: { width: '100%', gap: 6, marginBottom: 16 },
  freePointRow: { color: '#D1FAE5', fontSize: 13 },
  freePromoBox: { backgroundColor: '#065F46', borderRadius: 10, padding: 12, width: '100%' },
  freePromoText: { color: '#6EE7B7', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  breakdown: { backgroundColor: '#1F1535', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  breakdownTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#D1D5DB', fontSize: 15 },
  rowValue: { color: '#22C55E', fontSize: 15, fontWeight: '600' },
  rowValueRed: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  rowValueGold: { color: '#FBBF24', fontSize: 15, fontWeight: '600' },
  questionsReview: { backgroundColor: '#1F1535', borderRadius: 16, padding: 20, width: '100%', marginBottom: 32 },
  questionItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  questionEmoji: { fontSize: 16, marginRight: 8, marginTop: 2 },
  questionText: { color: 'white', fontSize: 14, flex: 1, lineHeight: 20 },
  yourAnswer: { color: '#9CA3AF', fontSize: 13, marginLeft: 24 },
  wrongAnswer: { color: '#EF4444', fontWeight: '600' },
  correctAnswerText: { color: '#9CA3AF', fontSize: 13, marginLeft: 24, marginTop: 2 },
  correctAnswer: { color: '#22C55E', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  secondaryBtnText: { color: '#6B7280', fontSize: 16 }
});