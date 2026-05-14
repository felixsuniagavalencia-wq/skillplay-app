export const API_URL = 'https://skillplay-production.up.railway.app';

export const endpoints = {
  // Auth
  register: `${API_URL}/api/auth/register`,
  profile: (userId: string) => `${API_URL}/api/auth/profile/${userId}`,
  
  // Game
  generate: `${API_URL}/api/game/generate`,
  submit: `${API_URL}/api/game/submit`,
  
  // Wallet
  balance: (userId: string) => `${API_URL}/api/wallet/balance/${userId}`,
  transactions: (userId: string) => `${API_URL}/api/wallet/transactions/${userId}`,
  withdraw: `${API_URL}/api/wallet/withdraw`,
};