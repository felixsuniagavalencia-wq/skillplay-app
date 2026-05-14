import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

export default function GameScreen({ sessionId, questions, userId, streak, onFinish }: {
  sessionId: string;
  questions: any[];
  userId: string;
  streak: number;
  onFinish: (result: any) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeStart, setTimeStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTimeStart(Date.now());
  }, [current]);

  const handleAnswer = async (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const responseTimeMs = Date.now() - timeStart;
    const newAnswers = [...answers, { selected: index, responseTimeMs }];
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (current + 1 < questions.length) {
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

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${((current + 1) / questions.length) * 100}%` as any }]} />
      </View>

      <Text style={styles.questionCount}>Question {current + 1} of {questions.length}</Text>
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
  progressBar: { height: 6, backgroundColor: '#1F1535', borderRadius: 3, marginBottom: 24 },
  progress: { height: 6, backgroundColor: '#7C3AED', borderRadius: 3 },
  questionCount: { color: '#6B7280', fontSize: 13, marginBottom: 16 },
  question: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 40, lineHeight: 32 },
  options: { gap: 12 },
  option: { backgroundColor: '#1F1535', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#374151' },
  optionSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  optionText: { color: '#D1D5DB', fontSize: 16 },
  optionTextSelected: { color: 'white', fontWeight: 'bold' }
});