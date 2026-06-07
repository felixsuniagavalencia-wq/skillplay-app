import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';

const API_URL = 'https://skillplay-production.up.railway.app';

type Screen = 'login' | 'register' | 'forgot' | 'reset';

export default function LoginScreen({ onLogin }: { onLogin: (userId: string) => void }) {
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) { onLogin(data.userId); }
      else { setError(data.error || 'Invalid email or password'); }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const userId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const res = await fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, username, password })
      });
      const data = await res.json();
      if (data.success) { onLogin(data.userId || userId); }
      else { setError(data.error || 'Registration failed'); }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(API_URL + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Code sent! Check your email.');
        setScreen('reset');
      } else { setError(data.error || 'Error sending email'); }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmNewPassword) { setError('Please fill in all fields'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(API_URL + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password updated! Please login.');
        setTimeout(() => { setScreen('login'); setSuccess(''); }, 2000);
      } else { setError(data.error || 'Invalid or expired code'); }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const goTo = (s: Screen) => { setScreen(s); setError(''); setSuccess(''); };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.appName}>SkillPlay</Text>
      <Text style={styles.subtitle}>Master. Progress. Earn.</Text>

      <View style={styles.form}>

        {screen === 'login' && (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#6B7280" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Enter your password" placeholderTextColor="#6B7280" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => goTo('forgot')} style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goTo('register')} style={styles.switchButton}>
              <Text style={styles.switchText}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </>
        )}

        {screen === 'register' && (
          <>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} placeholder="Enter your username" placeholderTextColor="#6B7280" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#6B7280" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Enter your password" placeholderTextColor="#6B7280" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Confirm your password" placeholderTextColor="#6B7280" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showConfirmPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Start My Journey</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goTo('login')} style={styles.switchButton}>
              <Text style={styles.switchText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </>
        )}

        {screen === 'forgot' && (
          <>
            <Text style={styles.sectionTitle}>Reset Password</Text>
            <Text style={styles.sectionSubtitle}>Enter your email and we'll send you a code to reset your password.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#6B7280" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goTo('login')} style={styles.switchButton}>
              <Text style={styles.switchText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}

        {screen === 'reset' && (
          <>
            <Text style={styles.sectionTitle}>Enter Code</Text>
            <Text style={styles.sectionSubtitle}>Enter the 6-digit code sent to your email and your new password.</Text>
            {success ? <Text style={styles.successText}>{success}</Text> : null}
            <Text style={styles.label}>Code</Text>
            <TextInput style={styles.input} placeholder="Enter 6-digit code" placeholderTextColor="#6B7280" value={resetCode} onChangeText={setResetCode} keyboardType="number-pad" maxLength={6} />
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Enter new password" placeholderTextColor="#6B7280" value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNewPassword} />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showNewPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput style={styles.input} placeholder="Confirm new password" placeholderTextColor="#6B7280" value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goTo('forgot')} style={styles.switchButton}>
              <Text style={styles.switchText}>Resend code</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0F0A1A', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 100, height: 100, borderRadius: 20, marginBottom: 16 },
  appName: { fontSize: 42, fontWeight: 'bold', color: '#7C3AED', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 48 },
  form: { width: '100%' },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center' },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, color: '#9CA3AF', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#1F1535', borderRadius: 12, padding: 16, color: 'white', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1535', borderRadius: 12, borderWidth: 1, borderColor: '#374151', marginBottom: 20 },
  passwordInput: { flex: 1, padding: 16, color: 'white', fontSize: 16 },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 16 },
  eyeText: { fontSize: 13, color: '#7C3AED', fontWeight: '600' },
  forgotButton: { alignItems: 'flex-end', marginBottom: 16, marginTop: -12 },
  forgotText: { color: '#7C3AED', fontSize: 13 },
  error: { color: '#EF4444', marginBottom: 16, textAlign: 'center' },
  successText: { color: '#22C55E', marginBottom: 16, textAlign: 'center', fontWeight: '600' },
  button: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#7C3AED', fontSize: 14 }
});