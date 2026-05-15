import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

const TIME_LIMITS: Record<string, number> = {
  basico: 20,
  medio: 15,
  avanzado: 10,
  experto: 7
};

export default function GameScreen({ sessionId, questions, userId, streak, difficulty, onFinish }: {
  sessionId: string;
  questions: any[];
  userId: string;
  streak: number;
  difficulty: string;
  onFinish: (result: any) => void;
}) {
  const timeLimit = TIME_LIMITS[difficulty] || 20;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timeStart, setTimeStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<any>(null);
  const animatedWidth = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [current]);

  const startTimer = () => {
    setTimeLeft(timeLimit);
    setTimeStart(Date.now());
    clearInterval(timerRef.current);

    Animated.timing(animatedWidth, {
      toValue: 0,
      duration: timeLimit * 1000,
      useNativeDriver: false
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1); // tiempo agotado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = async (index: number) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(index);
    const responseTimeMs = Date.now() - timeStart;
    const newAnswers = [...answers, { selected: index === -1 ? 0 : index, responseTimeMs, timedOut: index === -1 }];
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (current + 1 < questions.length) {
        animatedWidth.setValue(1);
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setSubmitting(true);
        try {
          const res = await fetch(API_URL + '/api/game/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, answers: newAnswers, streak })
          });
          const data = await res.json();
          onFinish(data);
        } catch (err) {
          onFinish({ error: true });
        }
        setSubmitting(false);
      }
    }, 800);
  };

  if (submitting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Calculating your reward...</Text>
      </View>
    );
  }

  const question = questions[current];
  const timerColor = timeLeft > 10 ? '#22C55E' : timeLeft > 5 ? '#FBBF24' : '#EF4444';

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${((current + 1) / questions.length) * 100}%` as any }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.questionCount}>Question {current + 1} of {questions.length}</Text>
        <Text style={[styles.timer, { color: timerColor }]}>{timeLeft}s</Text>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBarBg}>
        <Animated.View style={[styles.timerBar, {
          width: animatedWidth.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          }),
          backgroundColor: timerColor
        }]} />
      </View>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.options}>
        {question.options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, selected === index && styles.optionSelected]}
            onPress={() => handleAnswer(index)}
            disabled={selected !== null}>
            <Text style={[styles.optionText, selected === index && styles.optionTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1A', padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#0F0A1A', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#7C3AED', fontSize: 16, marginTop: 16 },
  progressBar: { height: 6, backgroundColor: '#1F1535', borderRadius: 3, marginBottom: 16 },
  progress: { height: 6, backgroundColor: '#7C3AED', borderRadius: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questionCount: { color: '#6B7280', fontSize: 13 },
  timer: { fontSize: 20, fontWeight: 'bold' },
  timerBarBg: { height: 4, backgroundColor: '#1F1535', borderRadius: 2, marginBottom: 32 },
  timerBar: { height: 4, borderRadius: 2 },
  question: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 40, lineHeight: 32 },
  options: { gap: 12 },
  option: { backgroundColor: '#1F1535', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#374151' },
  optionSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  optionText: { color: '#D1D5DB', fontSize: 16 },
  optionTextSelected: { color: 'white', fontWeight: 'bold' }
});