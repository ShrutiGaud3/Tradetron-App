/**
 * Central API Client for Tradetron App Frontend (React Native / Expo)
 * Connects to Neon PostgreSQL Algo Trading Backend
 */

import { Platform } from 'react-native';

// For Android emulator 10.0.2.2 is host loopback; for iOS simulator / web localhost is used.
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1');

// In-memory token storage (also works on React Native without async storage dependency)
let userAuthToken: string | null = null;
let currentAuthUser: any = null;

export const setAuthToken = (token: string | null, user?: any) => {
  userAuthToken = token;
  if (user) currentAuthUser = user;
};

export const getAuthToken = () => userAuthToken;
export const getStoredUser = () => currentAuthUser;

/**
 * Generic API Request Wrapper
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(userAuthToken ? { Authorization: `Bearer ${userAuthToken}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.status}`);
    }
    return data;
  } catch (error: any) {
    console.warn(`[API] Call to ${endpoint} failed:`, error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// AUTHENTICATION APIS
// -------------------------------------------------------------
export const apiLogin = async (email: string, password: string = 'Password@123') => {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.data?.tokens?.accessToken) {
    setAuthToken(res.data.tokens.accessToken, res.data.user);
  }
  return res.data;
};

export const apiRegister = async (name: string, email: string, password: string = 'Password@123', phone?: string) => {
  const res = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone }),
  });
  if (res.data?.tokens?.accessToken) {
    setAuthToken(res.data.tokens.accessToken, res.data.user);
  }
  return res.data;
};

export const apiGetProfile = async () => {
  const res = await apiRequest('/auth/me');
  return res.data?.user;
};

// -------------------------------------------------------------
// STRATEGIES APIS
// -------------------------------------------------------------
export const apiGetMarketplaceStrategies = async () => {
  const res = await apiRequest('/strategies/marketplace');
  return res.data?.strategies || [];
};

export const apiGetMyStrategies = async () => {
  const res = await apiRequest('/strategies/my');
  return res.data?.strategies || [];
};

export const apiCreateStrategy = async (strategyData: any) => {
  const res = await apiRequest('/strategies', {
    method: 'POST',
    body: JSON.stringify(strategyData),
  });
  return res.data?.strategy;
};

// -------------------------------------------------------------
// DEPLOYMENTS APIS
// -------------------------------------------------------------
export const apiGetDeployments = async () => {
  const res = await apiRequest('/deployments');
  return res.data?.deployments || [];
};

export const apiCreateDeployment = async (strategyId: string, brokerAccountId: string, mode: 'PAPER' | 'LIVE', multiplier: number = 1) => {
  const res = await apiRequest('/deployments', {
    method: 'POST',
    body: JSON.stringify({ strategyId, brokerAccountId, mode, multiplier }),
  });
  return res.data?.deployment;
};

export const apiPauseDeployment = async (id: string) => {
  return await apiRequest(`/deployments/${id}/pause`, { method: 'POST' });
};

export const apiResumeDeployment = async (id: string) => {
  return await apiRequest(`/deployments/${id}/resume`, { method: 'POST' });
};

export const apiStopDeployment = async (id: string) => {
  return await apiRequest(`/deployments/${id}/stop`, { method: 'POST' });
};

// -------------------------------------------------------------
// ORDERS & POSITIONS APIS
// -------------------------------------------------------------
export const apiGetOrders = async () => {
  const res = await apiRequest('/orders');
  return res.data?.orders || [];
};

export const apiGetPositions = async () => {
  const res = await apiRequest('/positions');
  return res.data?.positions || [];
};

// -------------------------------------------------------------
// BROKER MANAGEMENT APIS
// -------------------------------------------------------------
export const apiGetSupportedBrokers = async () => {
  const res = await apiRequest('/brokers');
  return res.data?.brokers || [];
};

export const apiGetMyBrokerAccounts = async () => {
  const res = await apiRequest('/broker-accounts');
  return res.data?.brokerAccounts || [];
};

export const apiConnectBroker = async (brokerData: any) => {
  const res = await apiRequest('/broker-accounts/connect', {
    method: 'POST',
    body: JSON.stringify(brokerData),
  });
  return res.data?.account;
};

// -------------------------------------------------------------
// REAL-TIME MARKET DATA APIS (Yahoo Finance / Live Indices)
// -------------------------------------------------------------
export const apiGetLiveIndices = async () => {
  const res = await apiRequest('/market/indices');
  return res.data?.indices || [];
};

export const apiGetLiveCandles = async (symbol: string = 'NIFTY', interval: string = '15m', days: number = 3) => {
  const res = await apiRequest(`/market/candles?symbol=${symbol}&interval=${interval}&days=${days}`);
  return res.data?.candles || [];
};
