import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

const TIME_LIMITS: Record<string, number> = {
  basico: 20,
  medio: 15,
  avanzado: 10,
  experto: 7
};

const EPIC_TIME_LIMIT = 7;

export default function GameScreen({ sessionId, questions, fullQuestions, userId, streak, difficulty, onFinish }: {
  sessionId: string;
  questions: any[];
  fullQuestions: any[];
  userId: string;
  streak: number;
  difficulty: string;
  onFinish: (result: any, answeredQuestions: any[]) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeStart, setTimeStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showEpicIntro, setShowEpicIntro] = useState(false);
  const timerRef = useRef<any>(null);
  const animatedWidth = useRef(new Animated.Value(1)).current;
  const epicAnim = useRef(new Animated.Value(0)).current;

  const isEpic = questions[current]?.isEpic || false;
  const epicPrize = questions[current]?.epicPrize || 0;
  const timeLimit = isEpic ? EPIC_TIME_LIMIT : (TIME_LIMITS[difficulty] || 20);

  useEffect(() => {
    if (isEpic) {
      setShowEpicIntro(true);
      Animated.sequence([
        Animated.timing(epicAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(epicAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => {
        setShowEpicIntro(false);
        startTimer();
      });
    } else {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [current]);

  const startTimer = () => {
    const limit = isEpic ? EPIC_TIME_LIMIT : (TIME_LIMITS[difficulty] || 20);
    setTimeLeft(limit);
    setTimeStart(Date.now());
    clearInterval(timerRef.current);

    animatedWidth.setValue(1);
    Animated.timing(animatedWidth, {
      toValue: 0,
      duration: limit * 1000,
      useNativeDriver: false
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1);
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
    const correctIndex = fullQuestions[current]?.correct ?? questions[current]?.correct;
    const isCorrect = index === correctIndex;

    const newAnswers = [...answers, {
      selected: index === -1 ? 0 : index,
      responseTimeMs,
      timedOut: index === -1,
      isCorrect,
      correctIndex,
      question: questions[current]?.question,
      options: questions[current]?.options,
      selectedOption: index >= 0 ? questions[current]?.options[index] : 'Time out',
      correctOption: questions[current]?.options[correctIndex],
      isEpic: questions[current]?.isEpic || false
    }];
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
            body: JSON.stringify({
              sessionId,
              answers: newAnswers.map(a => ({ selected: a.selected, responseTimeMs: a.responseTimeMs })),
              streak
            })
          });
          const data = await res.json();
          onFinish(data, newAnswers);
        } catch (err) {
          onFinish({ error: true }, newAnswers);
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

  if (showEpicIntro) {
    return (
      <Animated.View style={[styles.epicIntro, { opacity: epicAnim }]}>
        <Text style={styles.epicIntroEmoji}>⚡</Text>
        <Text style={styles.epicIntroTitle}>¡PREGUNTA ÉPICA!</Text>
        <Text style={styles.epicIntroSubtitle}>Si aciertas esta pregunta ganas</Text>
        <Text style={styles.epicIntroPrize}>+{epicPrize.toFixed(2)} EUR</Text>
        <Text style={styles.epicIntroTime}>Solo tienes {EPIC_TIME_LIMIT} segundos</Text>
      </Animated.View>
    );
  }

  const question = questions[current];
  const timerColor = timeLeft > 10 ? '#22C55E' : timeLeft > 5 ? '#FBBF24' : '#EF4444';

  return (
    <View style={[styles.container, isEpic && styles.epicContainer]}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${((current + 1) / questions.length) * 100}%` as any }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.questionCount}>Question {current + 1} of {questions.length}</Text>
        <Text style={[styles.timer, { color: isEpic ? '#FBBF24' : timerColor }]}>{timeLeft}s</Text>
      </View>

      <View style={styles.timerBarBg}>
        <Animated.View style={[styles.timerBar, {
          width: animatedWidth.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          }),
          backgroundColor: isEpic ? '#FBBF24' : timerColor
        }]} />
      </View>

      {isEpic && (
        <View style={styles.epicBanner}>
          <Text style={styles.epicBannerText}>⚡ PREGUNTA ÉPICA — Acierta y gana {epicPrize.toFixed(2)} EUR extra</Text>
        </View>
      )}

      <Text style={[styles.question, isEpic && styles.epicQuestion]}>{question.question}</Text>

      <View style={styles.options}>
        {question.options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isEpic && styles.epicOption,
              selected === index && (isEpic ? styles.epicOptionSelected : styles.optionSelected)
            ]}
            onPress={() => handleAnswer(index)}
            disabled={selected !== null}>
            <Text style={[
              styles.optionText,
              selected === index && styles.optionTextSelected
            ]}>
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
  epicContainer: { backgroundColor: '#1A0A00' },
  center: { flex: 1, backgroundColor: '#0F0A1A', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#7C3AED', fontSize: 16, marginTop: 16 },
  progressBar: { height: 6, backgroundColor: '#1F1535', borderRadius: 3, marginBottom: 16 },
  progress: { height: 6, backgroundColor: '#7C3AED', borderRadius: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questionCount: { color: '#6B7280', fontSize: 13 },
  timer: { fontSize: 20, fontWeight: 'bold' },
  timerBarBg: { height: 4, backgroundColor: '#1F1535', borderRadius: 2, marginBottom: 16 },
  timerBar: { height: 4, borderRadius: 2 },
  epicBanner: { backgroundColor: '#78350F', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FBBF24' },
  epicBannerText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  question: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 40, lineHeight: 32 },
  epicQuestion: { color: '#FDE68A', fontSize: 20 },
  options: { gap: 12 },
  option: { backgroundColor: '#1F1535', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#374151' },
  epicOption: { borderColor: '#78350F' },
  optionSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  epicOptionSelected: { backgroundColor: '#D97706', borderColor: '#FBBF24' },
  optionText: { color: '#D1D5DB', fontSize: 16 },
  optionTextSelected: { color: 'white', fontWeight: 'bold' },
  epicIntro: { flex: 1, backgroundColor: '#1A0A00', alignItems: 'center', justifyContent: 'center', padding: 24 },
  epicIntroEmoji: { fontSize: 80, marginBottom: 16 },
  epicIntroTitle: { fontSize: 36, fontWeight: 'bold', color: '#FBBF24', marginBottom: 16, textAlign: 'center' },
  epicIntroSubtitle: { fontSize: 18, color: '#D1D5DB', marginBottom: 8, textAlign: 'center' },
  epicIntroPrize: { fontSize: 48, fontWeight: 'bold', color: '#22C55E', marginBottom: 16 },
  epicIntroTime: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});