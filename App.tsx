import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import WalletScreen from './screens/WalletScreen';
import TopUpScreen from './screens/TopUpScreen';

type Screen = 'login' | 'home' | 'game' | 'result' | 'wallet' | 'topup';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TA7OVEwynFK9hgR85ZBTk4fBQOcfx5YGQxBlH8fbF5bFfB4PvNW3ffRjadVljR6zhwup4Er70by72wyQxK0JGII00HdoyPxFU';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState('basico');
  const [result, setResult] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [balance, setBalance] = useState(0);

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
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StatusBar style="light" />
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'home' && (
        <HomeScreen
          userId={userId}
          onStartGame={handleStartGame}
          onGoToWallet={() => setScreen('wallet')}
          onTopUp={() => setScreen('topup')}
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
          onTopUp={() => setScreen('topup')}
        />
      )}
      {screen === 'topup' && (
        <TopUpScreen
          userId={userId}
          onBack={() => setScreen('wallet')}
          onSuccess={(newBalance) => {
            setBalance(newBalance);
            setScreen('wallet');
          }}
        />
      )}
    </StripeProvider>
  );
}