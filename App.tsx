import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import WalletScreen from './screens/WalletScreen';

type Screen = 'login' | 'home' | 'game' | 'result' | 'wallet';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState('basico');
  const [result, setResult] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  const handleLogin = (id: string) => {
    setUserId(id);
    setScreen('home');
  };

  const handleStartGame = (sid: string, qs: any[], diff: string) => {
    setSessionId(sid);
    setQuestions(qs);
    setDifficulty(diff);
    setScreen('game');
  };

  const handleFinish = (res: any) => {
    setResult(res);
    if (res?.accuracy === 100) setStreak(s => s + 1);
    else setStreak(0);
    setScreen('result');
  };

  return (
    <>
      <StatusBar style="light" />
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'home' && (
        <HomeScreen
          userId={userId}
          onStartGame={handleStartGame}
          onGoToWallet={() => setScreen('wallet')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          sessionId={sessionId}
          questions={questions}
          userId={userId}
          streak={streak}
          difficulty={difficulty}
          onFinish={handleFinish}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          result={result}
          onPlayAgain={() => setScreen('home')}
          onGoHome={() => setScreen('home')}
        />
      )}
      {screen === 'wallet' && (
        <WalletScreen
          userId={userId}
          onBack={() => setScreen('home')}
        />
      )}
    </>
  );
}