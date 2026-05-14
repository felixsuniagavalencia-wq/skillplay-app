import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';

type Screen = 'login' | 'home' | 'game' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  const handleLogin = (id: string) => {
    setUserId(id);
    setScreen('home');
  };

  const handleStartGame = (sid: string, qs: any[]) => {
    setSessionId(sid);
    setQuestions(qs);
    setScreen('game');
  };

  const handleFinish = (res: any) => {
    setResult(res);
    if (res?.accuracy === 100) setStreak(s => s + 1);
    else setStreak(0);
    setScreen('result');
  };

  const handlePlayAgain = () => {
    setScreen('home');
  };

  return (
    <>
      <StatusBar style="light" />
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'home' && (
        <HomeScreen
          userId={userId}
          onStartGame={handleStartGame}
          onGoToWallet={() => {}}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          sessionId={sessionId}
          questions={questions}
          userId={userId}
          streak={streak}
          onFinish={handleFinish}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          result={result}
          onPlayAgain={handlePlayAgain}
          onGoHome={() => setScreen('home')}
        />
      )}
    </>
  );
}