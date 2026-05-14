import axios from 'axios';
import { endpoints } from '../constants/api';

export const generateGame = async (
  category: string,
  difficulty: string,
  entryFee: number,
  userId: string
) => {
  const response = await axios.post(endpoints.generate, {
    category,
    difficulty,
    entryFee,
    userId
  });
  return response.data;
};

export const submitGame = async (
  sessionId: string,
  answers: { selected: number; responseTimeMs: number }[],
  streak: number
) => {
  const response = await axios.post(endpoints.submit, {
    sessionId,
    answers,
    streak
  });
  return response.data;
};

export const getBalance = async (userId: string) => {
  const response = await axios.get(endpoints.balance(userId));
  return response.data;
};

export const getTransactions = async (userId: string) => {
  const response = await axios.get(endpoints.transactions(userId));
  return response.data;
};