import { create } from 'zustand';
import { 
  User, 
  BrokerAccount, 
  Strategy, 
  Deployment, 
  Position, 
  Order, 
  PortfolioSummary,
  MarketIndexQuote,
  AppNotification,
  NotificationPreferences,
  StrategyReview,
  CreatorProfile,
  CreatorEarningsSummary,
  UserKYC,
  TradetronPlanTier,
  PlatformInvoice,
  SupportTicket
} from '../types';
import { 
  mockUser, 
  mockNotifications,
  mockNotificationPreferences,
  mockCreators,
  mockCreatorEarnings,
  mockReviews,
  mockKYC,
  mockPlanTiers,
  mockPlatformInvoices,
  mockSupportTickets
} from '../data/mockData';
import { initialMarketIndices } from '../data/marketData';
import { marketDataService } from '../services/marketDataService';
import {
  apiLogin,
  apiGetProfile,
  apiGetMarketplaceStrategies,
  apiGetMyStrategies,
  apiGetMyBrokerAccounts,
  apiGetDeployments,
  apiGetPositions,
  apiGetOrders,
} from '../services/apiClient';

export type AuthStage = 'SPLASH' | 'ONBOARDING' | 'LOGIN' | 'OTP' | 'PIN_LOCK' | 'AUTHENTICATED';

interface AppState {
  // Auth & Session
  authStage: AuthStage;
  otpTarget: string;
  user: User;
  isAuthenticated: boolean;
  isProfileOpen: boolean;

  // Module 3: Market Data & Real-Time Engine
  indices: MarketIndexQuote[];
  isLiveTickerActive: boolean;
  isOptionChainOpen: boolean;
  selectedOptionUnderlying: 'NIFTY' | 'BANKNIFTY';

  // Module 6: Analytics & Notifications
  isNotificationsOpen: boolean;
  isAnalyticsOpen: boolean;
  notifications: AppNotification[];
  notificationPreferences: NotificationPreferences;

  // Module 7: Marketplace Monetization, Creator Studio & Social Copy-Trading
  creators: CreatorProfile[];
  creatorEarnings: CreatorEarningsSummary;
  reviews: Record<string, StrategyReview[]>;
  isPublishModalOpen: boolean;
  isCreatorStudioOpen: boolean;
  isLeaderboardOpen: boolean;
  isReviewsModalOpen: boolean;
  selectedStrategyForReviews: Strategy | null;
  isCheckoutModalOpen: boolean;
  selectedStrategyForCheckout: Strategy | null;

  // Module 8: KYC, Security, Platform Subscriptions & Helpdesk
  kyc: UserKYC;
  planTiers: TradetronPlanTier[];
  platformInvoices: PlatformInvoice[];
  supportTickets: SupportTicket[];
  currentPin: string;
  isBiometricEnabled: boolean;
  sessionTimeoutMinutes: number;
  isKycModalOpen: boolean;
  isSecurityModalOpen: boolean;
  isPlansModalOpen: boolean;
  isLegalModalOpen: boolean;
  isHelpModalOpen: boolean;

  // Trading Data
  portfolio: PortfolioSummary;
  brokers: BrokerAccount[];
  strategies: Strategy[];
  deployments: Deployment[];
  positions: Position[];
  orders: Order[];
  isKillSwitchActive: boolean;
  searchQuery: string;

  // Auth Actions
  finishSplash: () => void;
  finishOnboarding: () => void;
  goToLogin: () => void;
  requestOtp: (target: string) => void;
  verifyOtpSuccess: () => void;
  unlockWithPinSuccess: () => void;
  logout: () => void;
  setProfileOpen: (open: boolean) => void;

  // Module 2: Broker Actions
  connectBroker: (brokerCode: BrokerAccount['brokerCode'], accountRef: string, authType?: BrokerAccount['authType']) => void;
  refreshBrokerToken: (brokerId: string) => void;
  setPrimaryBroker: (brokerId: string) => void;
  disconnectBroker: (brokerId: string) => void;
  syncBrokerMargins: (brokerId: string) => void;

  // Module 3: Market Actions
  toggleLiveTicker: () => void;
  setOptionChainOpen: (open: boolean, underlying?: 'NIFTY' | 'BANKNIFTY') => void;
  applyMarketTick: (updatedIndices: MarketIndexQuote[], positionUpdates: Array<{ id: string; ltp: number; pnl: number; pnlPercent: number }>) => void;

  // Module 4: Strategy Builder & Management
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (strategyId: string, updates: Partial<Strategy>) => void;
  deleteStrategy: (strategyId: string) => void;

  // Module 5: Live Execution & Multi-Broker Deployment
  deployStrategyWithConfig: (config: {
    strategyId: string;
    mode: 'PAPER' | 'LIVE';
    brokerId: string;
    multiplier: number;
    orderType?: 'MARKET' | 'LIMIT' | 'SL_M';
    executionMode?: 'AUTO' | 'MANUAL_APPROVAL';
    targetProfitLimit?: number;
    maxLossLimit?: number;
    multiBrokers?: Array<{ brokerId: string; brokerName: string; multiplier: number }>;
  }) => void;
  emergencySquareOffDeployment: (deploymentId: string) => void;
  updateDeploymentConfig: (deploymentId: string, updates: Partial<Deployment>) => void;

  // Module 6: Notifications & Analytics Actions
  setNotificationsOpen: (open: boolean) => void;
  setAnalyticsOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;

  // Module 7: Marketplace Monetization, Creator Studio & Social Copy-Trading
  setPublishModalOpen: (open: boolean) => void;
  setCreatorStudioOpen: (open: boolean) => void;
  setLeaderboardOpen: (open: boolean) => void;
  setReviewsModalOpen: (open: boolean, strategy?: Strategy | null) => void;
  setCheckoutModalOpen: (open: boolean, strategy?: Strategy | null) => void;
  toggleSubscribeStrategy: (strategyId: string) => void;
  publishStrategyToMarketplace: (newStrategy: Partial<Strategy>) => void;
  addStrategyReview: (strategyId: string, review: { rating: number; comment: string; userName?: string }) => void;
  requestCreatorPayout: (amount: number) => void;

  // Module 8: KYC, Security, Plans & Support Actions
  setKycModalOpen: (open: boolean) => void;
  setSecurityModalOpen: (open: boolean) => void;
  setPlansModalOpen: (open: boolean) => void;
  setLegalModalOpen: (open: boolean) => void;
  setHelpModalOpen: (open: boolean) => void;
  updatePin: (oldPin: string, newPin: string) => boolean;
  toggleBiometrics: (enabled: boolean) => void;
  setSessionTimeout: (minutes: number) => void;
  upgradePlatformPlan: (planId: string) => void;
  createSupportTicket: (ticket: { category: SupportTicket['category']; subject: string; message: string; priority?: SupportTicket['priority'] }) => void;
  addTicketMessage: (ticketId: string, message: string) => void;

  // Trading Actions
  toggleKillSwitch: () => void;
  pauseDeployment: (id: string) => void;
  resumeDeployment: (id: string) => void;
  stopDeployment: (id: string) => void;
  deployStrategy: (strategyId: string, mode: 'PAPER' | 'LIVE', brokerId: string, multiplier: number) => void;
  setSearchQuery: (query: string) => void;
  squareOffPosition: (positionId: string) => void;

  // Live Database Sync
  isLoadingFromBackend: boolean;
  loadDataFromBackend: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth initial state
  authStage: 'SPLASH',
  otpTarget: '+91 98765 43210',
  user: mockUser,
  isAuthenticated: false,
  isProfileOpen: false,

  // Module 3: Market Data initial state
  indices: initialMarketIndices,
  isLiveTickerActive: true,
  isOptionChainOpen: false,
  selectedOptionUnderlying: 'NIFTY',

  // Module 6: Analytics & Notifications initial state
  isNotificationsOpen: false,
  isAnalyticsOpen: false,
  notifications: mockNotifications,
  notificationPreferences: mockNotificationPreferences,

  // Module 7: Marketplace initial state
  creators: mockCreators,
  creatorEarnings: mockCreatorEarnings,
  reviews: {
    'strat_01': mockReviews,
    'strat_02': [
      {
        id: 'rev_3',
        userName: 'Rahul Deshmukh',
        rating: 5,
        comment: 'Great breakout trend capture on BankNifty weekly options.',
        date: '1 day ago',
        profitVerified: true,
      }
    ],
    'strat_03': [
      {
        id: 'rev_4',
        userName: 'Amitabh Joshi',
        rating: 4,
        comment: 'Solid theta decay buffer, safe for capital above 2L.',
        date: '3 days ago',
        profitVerified: true,
      }
    ]
  },
  isPublishModalOpen: false,
  isCreatorStudioOpen: false,
  isLeaderboardOpen: false,
  isReviewsModalOpen: false,
  selectedStrategyForReviews: null,
  isCheckoutModalOpen: false,
  selectedStrategyForCheckout: null,

  // Module 8: KYC, Security, Subscriptions & Helpdesk initial state
  kyc: mockKYC,
  planTiers: mockPlanTiers,
  platformInvoices: mockPlatformInvoices,
  supportTickets: mockSupportTickets,
  currentPin: '1234',
  isBiometricEnabled: true,
  sessionTimeoutMinutes: 15,
  isKycModalOpen: false,
  isSecurityModalOpen: false,
  isPlansModalOpen: false,
  isLegalModalOpen: false,
  isHelpModalOpen: false,

  // Trading initial state (Clean DB defaults - 0 mock records)
  portfolio: {
    totalValue: 100000,
    stockPortfolio: 0,
    cryptoPortfolio: 0,
    algoPortfolio: 0,
    todayPnL: 0,
    overallPnL: 0,
    gainToPainRatio: 2.1,
    rewardToRiskRatio: 1.8,
    leverageUsed: 1.0,
    activeDeploymentsCount: 0,
    openPositionsCount: 0,
  },
  brokers: [],
  strategies: [],
  deployments: [],
  positions: [],
  orders: [],
  isKillSwitchActive: false,
  searchQuery: '',
  isLoadingFromBackend: false,

  // Auth Action Handlers
  finishSplash: () => set({ authStage: 'ONBOARDING' }),
  finishOnboarding: () => set({ authStage: 'LOGIN' }),
  goToLogin: () => set({ authStage: 'LOGIN' }),
  requestOtp: (target: string) => set({ authStage: 'OTP', otpTarget: target }),
  verifyOtpSuccess: () => set({ authStage: 'PIN_LOCK' }),
  unlockWithPinSuccess: () => {
    set({ authStage: 'AUTHENTICATED', isAuthenticated: true });
    // Start market ticker when user authenticates
    marketDataService.start(() => get().positions);
    // Load live user trading data from Neon PostgreSQL database
    get().loadDataFromBackend();
  },
  logout: () => {
    marketDataService.stop();
    set({ authStage: 'LOGIN', isAuthenticated: false, isProfileOpen: false });
  },
  setProfileOpen: (open: boolean) => set({ isProfileOpen: open }),

  // Module 2: Broker Management
  connectBroker: (brokerCode, accountRef, authType = 'OAUTH') => set((state) => {
    const updatedBrokers = state.brokers.map((b) => {
      if (b.brokerCode === brokerCode) {
        return {
          ...b,
          status: 'CONNECTED' as const,
          accountRef,
          authType,
          availableFunds: b.availableFunds > 0 ? b.availableFunds : 150000.00,
          lastSyncAt: 'Just now',
          tokenExpiresAt: 'Today at 23:59',
          tokenExpiryMinutes: 480,
          pingLatencyMs: Math.floor(14 + Math.random() * 12),
          connectionLogs: [
            {
              id: `log_${Date.now()}`,
              type: 'AUTH_SUCCESS' as const,
              message: `Connected & authorized via ${authType}`,
              timestamp: 'Just now',
            },
            ...b.connectionLogs,
          ],
        };
      }
      return b;
    });
    return { brokers: updatedBrokers };
  }),

  refreshBrokerToken: (brokerId: string) => set((state) => ({
    brokers: state.brokers.map((b) => {
      if (b.id === brokerId) {
        return {
          ...b,
          status: 'CONNECTED' as const,
          lastSyncAt: 'Just now',
          tokenExpiresAt: 'Today at 23:59',
          tokenExpiryMinutes: 480,
          pingLatencyMs: Math.floor(12 + Math.random() * 10),
          connectionLogs: [
            {
              id: `log_${Date.now()}`,
              type: 'TOKEN_REFRESH' as const,
              message: 'JWT Token refreshed successfully. Valid until 23:59 IST',
              timestamp: 'Just now',
            },
            ...b.connectionLogs,
          ],
        };
      }
      return b;
    })
  })),

  setPrimaryBroker: (brokerId: string) => set((state) => ({
    brokers: state.brokers.map((b) => ({
      ...b,
      isPrimary: b.id === brokerId,
      accountRef: b.id === brokerId ? b.accountRef.replace(' (Primary)', '') + ' (Primary)' : b.accountRef.replace(' (Primary)', ''),
    }))
  })),

  disconnectBroker: (brokerId: string) => set((state) => ({
    brokers: state.brokers.map((b) => {
      if (b.id === brokerId) {
        return {
          ...b,
          status: 'DISCONNECTED' as const,
          isPrimary: false,
          availableFunds: 0,
          usedMargin: 0,
          lastSyncAt: 'Just now',
          tokenExpiresAt: 'N/A',
          tokenExpiryMinutes: 0,
          pingLatencyMs: 0,
          connectionLogs: [
            {
              id: `log_${Date.now()}`,
              type: 'ERROR' as const,
              message: 'Broker account disconnected and tokens revoked',
              timestamp: 'Just now',
            },
            ...b.connectionLogs,
          ],
        };
      }
      return b;
    })
  })),

  syncBrokerMargins: (brokerId: string) => set((state) => ({
    brokers: state.brokers.map((b) => {
      if (b.id === brokerId) {
        return {
          ...b,
          lastSyncAt: 'Just now',
          connectionLogs: [
            {
              id: `log_${Date.now()}`,
              type: 'MARGIN_SYNC' as const,
              message: `Funds & Margin sync completed. Available: ₹${b.availableFunds.toLocaleString()}`,
              timestamp: 'Just now',
            },
            ...b.connectionLogs,
          ],
        };
      }
      return b;
    })
  })),

  // Module 3: Market Data Handlers
  toggleLiveTicker: () => {
    const isCurrentlyActive = get().isLiveTickerActive;
    if (isCurrentlyActive) {
      marketDataService.stop();
      set({ isLiveTickerActive: false });
    } else {
      marketDataService.start(() => get().positions);
      set({ isLiveTickerActive: true });
    }
  },

  setOptionChainOpen: (open: boolean, underlying = 'NIFTY') => set({
    isOptionChainOpen: open,
    selectedOptionUnderlying: underlying,
  }),

  applyMarketTick: (updatedIndices, positionUpdates) => set((state) => {
    // 1. Update positions
    const posMap = new Map(positionUpdates.map(u => [u.id, u]));
    let netPositionsDelta = 0;

    const updatedPositions = state.positions.map((p) => {
      const update = posMap.get(p.id);
      if (update) {
        netPositionsDelta += update.pnl;
        return {
          ...p,
          ltp: update.ltp,
          pnl: update.pnl,
          pnlPercent: update.pnlPercent,
        };
      }
      return p;
    });

    // 2. Update today's P&L and total portfolio value
    const updatedTodayPnL = parseFloat((1400 + netPositionsDelta * 0.4).toFixed(2));
    const updatedTotalValue = parseFloat((44553 + updatedTodayPnL).toFixed(2));

    return {
      indices: updatedIndices,
      positions: updatedPositions,
      portfolio: {
        ...state.portfolio,
        todayPnL: updatedTodayPnL,
        totalValue: updatedTotalValue,
      },
    };
  }),

  // Trading Action Handlers
  toggleKillSwitch: () => set((state) => ({ isKillSwitchActive: !state.isKillSwitchActive })),

  pauseDeployment: (id: string) => set((state) => ({
    deployments: state.deployments.map((d) => 
      d.id === id ? { ...d, status: 'PAUSED' } : d
    )
  })),

  resumeDeployment: (id: string) => set((state) => ({
    deployments: state.deployments.map((d) => 
      d.id === id ? { ...d, status: 'ACTIVE' } : d
    )
  })),

  stopDeployment: (id: string) => set((state) => ({
    deployments: state.deployments.map((d) => 
      d.id === id ? { ...d, status: 'STOPPED' } : d
    )
  })),

  // Module 4: Strategy Builder Actions
  addStrategy: (strategy: Strategy) => set((state) => ({
    strategies: [strategy, ...state.strategies],
  })),

  updateStrategy: (strategyId: string, updates: Partial<Strategy>) => set((state) => ({
    strategies: state.strategies.map((s) => s.id === strategyId ? { ...s, ...updates } : s),
  })),

  deleteStrategy: (strategyId: string) => set((state) => ({
    strategies: state.strategies.filter((s) => s.id !== strategyId),
  })),

  // Module 5: Live Execution & Multi-Broker Deployment Implementation
  deployStrategyWithConfig: (config) => {
    const strategy = get().strategies.find((s) => s.id === config.strategyId);
    const broker = get().brokers.find((b) => b.id === config.brokerId);
    if (!strategy) return;

    const depId = `dep_${Date.now()}`;
    const capitalAllocated = (strategy.capitalRequired || 100000) * config.multiplier;

    const initialAuditLogs = [
      {
        id: `log_1_${Date.now()}`,
        timestamp: 'Just now',
        type: 'SIGNAL' as const,
        message: `Deployment initialized in ${config.mode} mode (${config.multiplier}x multiplier)`,
        details: `Broker: ${config.mode === 'PAPER' ? 'Virtual Paper Engine' : (broker?.brokerName || 'Primary Broker')}`,
      },
      {
        id: `log_2_${Date.now()}`,
        timestamp: 'Just now',
        type: 'ORDER_PLACED' as const,
        message: `Multi-Leg condition evaluator active (${strategy.conditions.length} rules, ${strategy.legs.length} legs)`,
        details: `Risk Guard: Max Loss ₹${config.maxLossLimit || strategy.stopLoss || 2500} | Target ₹${config.targetProfitLimit || strategy.targetProfit || 5000}`,
      },
    ];

    const newDeployment: Deployment = {
      id: depId,
      strategyId: config.strategyId,
      strategyName: strategy.name,
      mode: config.mode,
      brokerAccountId: config.brokerId,
      brokerName: config.mode === 'PAPER' ? 'Virtual Paper Broker' : (broker?.brokerName || 'Connected Broker'),
      status: 'ACTIVE',
      multiplier: config.multiplier,
      deployedAt: 'Just now',
      todayPnL: 0,
      overallPnL: 0,
      todayPnLPercent: 0,
      activeLegsCount: strategy.legs.length,
      lastSignal: 'Engine listening for entry conditions',
      orderType: config.orderType || 'MARKET',
      executionMode: config.executionMode || 'AUTO',
      capitalAllocated,
      targetProfitLimit: config.targetProfitLimit,
      maxLossLimit: config.maxLossLimit,
      multiBrokers: config.multiBrokers,
      auditLogs: initialAuditLogs,
    };

    // Automatically generate sample live positions for the deployed strategy legs
    const generatedPositions = strategy.legs.map((leg, idx) => {
      const isCE = leg.optionType === 'CE';
      const baseLtp = isCE ? 142.50 : 128.20;
      const lotSize = leg.instrument.includes('BANKNIFTY') ? 15 : 25;
      const totalQty = (leg.lots || 1) * lotSize * config.multiplier;

      return {
        id: `pos_${depId}_${idx + 1}`,
        deploymentId: depId,
        strategyName: strategy.name,
        instrument: `${leg.instrument} 24800 ${leg.optionType || 'CE'}`,
        symbol: `${leg.instrument} 24800 ${leg.optionType || 'CE'}`,
        segment: leg.segment,
        side: leg.action,
        qty: leg.action === 'BUY' ? totalQty : -totalQty,
        avgPrice: baseLtp,
        ltp: baseLtp,
        pnl: 0,
        pnlPercent: 0,
        status: 'OPEN' as const,
      };
    });

    const generatedOrders: Order[] = generatedPositions.map((pos) => ({
      id: `ord_${Date.now()}_${pos.id}`,
      deploymentId: depId,
      strategyName: strategy.name,
      brokerOrderId: `TR_${Math.floor(100000 + Math.random() * 900000)}`,
      instrument: pos.instrument,
      side: pos.side,
      type: (config.orderType === 'SL_M' ? 'SL-M' : (config.orderType || 'MARKET')) as Order['type'],
      qty: Math.abs(pos.qty),
      price: pos.avgPrice,
      status: 'EXECUTED' as const,
      timestamp: 'Just now',
    }));

    set((state) => ({
      deployments: [newDeployment, ...state.deployments],
      positions: [...generatedPositions, ...state.positions],
      orders: [...generatedOrders, ...state.orders],
      portfolio: {
        ...state.portfolio,
        activeDeploymentsCount: state.portfolio.activeDeploymentsCount + 1,
        openPositionsCount: state.portfolio.openPositionsCount + generatedPositions.length,
      }
    }));
  },

  emergencySquareOffDeployment: (deploymentId: string) => set((state) => {
    const targetDep = state.deployments.find((d) => d.id === deploymentId);
    if (!targetDep) return state;

    const positionsToClose = state.positions.filter((p) => p.deploymentId === deploymentId);
    const newExitOrders: Order[] = positionsToClose.map((p) => ({
      id: `ord_sq_${Date.now()}_${p.id}`,
      deploymentId,
      strategyName: targetDep.strategyName,
      brokerOrderId: `SQ_${Math.floor(100000 + Math.random() * 900000)}`,
      instrument: p.instrument,
      side: p.side === 'BUY' ? 'SELL' : 'BUY',
      type: 'MARKET',
      qty: Math.abs(p.qty),
      price: p.ltp,
      status: 'EXECUTED',
      timestamp: 'Just now',
    }));

    const exitLog = {
      id: `log_sq_${Date.now()}`,
      timestamp: 'Just now',
      type: 'SQUARE_OFF' as const,
      message: `Emergency market square-off executed (${positionsToClose.length} positions closed)`,
      details: 'Algo stopped and all legs liquidated at market price',
    };

    return {
      deployments: state.deployments.map((d) => 
        d.id === deploymentId 
          ? { 
              ...d, 
              status: 'STOPPED', 
              activeLegsCount: 0,
              lastSignal: 'Strategy stopped (Emergency Exit)',
              auditLogs: [exitLog, ...(d.auditLogs || [])]
            } 
          : d
      ),
      positions: state.positions.filter((p) => p.deploymentId !== deploymentId),
      orders: [...newExitOrders, ...state.orders],
      portfolio: {
        ...state.portfolio,
        openPositionsCount: Math.max(0, state.portfolio.openPositionsCount - positionsToClose.length),
      }
    };
  }),

  updateDeploymentConfig: (deploymentId: string, updates: Partial<Deployment>) => set((state) => ({
    deployments: state.deployments.map((d) => 
      d.id === deploymentId ? { ...d, ...updates } : d
    ),
  })),

  deployStrategy: (strategyId: string, mode: 'PAPER' | 'LIVE', brokerId: string, multiplier: number) => {
    get().deployStrategyWithConfig({
      strategyId,
      mode,
      brokerId,
      multiplier,
    });
  },

  // Module 6: Notifications & Analytics Actions Implementation
  setNotificationsOpen: (open: boolean) => set({ isNotificationsOpen: open }),
  setAnalyticsOpen: (open: boolean) => set({ isAnalyticsOpen: open }),
  
  markNotificationAsRead: (id: string) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
  })),

  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
  })),

  clearAllNotifications: () => set({ notifications: [] }),

  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => set((state) => ({
    notificationPreferences: { ...state.notificationPreferences, ...updates },
  })),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  squareOffPosition: (positionId: string) => set((state) => {
    const targetPos = state.positions.find((p) => p.id === positionId);
    if (!targetPos) return state;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      deploymentId: targetPos.deploymentId,
      strategyName: targetPos.strategyName,
      brokerOrderId: `SQ_${Math.floor(100000 + Math.random() * 900000)}`,
      instrument: targetPos.instrument,
      side: targetPos.side === 'BUY' ? 'SELL' : 'BUY',
      type: 'MARKET',
      qty: Math.abs(targetPos.qty),
      price: targetPos.ltp,
      status: 'EXECUTED',
      timestamp: 'Just now',
    };

    return {
      positions: state.positions.filter((p) => p.id !== positionId),
      orders: [newOrder, ...state.orders],
      portfolio: {
        ...state.portfolio,
        openPositionsCount: Math.max(0, state.portfolio.openPositionsCount - 1),
      }
    };
  }),

  // Module 7: Marketplace Monetization, Creator Studio & Social Copy-Trading Action Implementations
  setPublishModalOpen: (open: boolean) => set({ isPublishModalOpen: open }),
  setCreatorStudioOpen: (open: boolean) => set({ isCreatorStudioOpen: open }),
  setLeaderboardOpen: (open: boolean) => set({ isLeaderboardOpen: open }),
  setReviewsModalOpen: (open: boolean, strategy?: Strategy | null) => set({ 
    isReviewsModalOpen: open, 
    selectedStrategyForReviews: strategy || null 
  }),
  setCheckoutModalOpen: (open: boolean, strategy?: Strategy | null) => set({ 
    isCheckoutModalOpen: open, 
    selectedStrategyForCheckout: strategy || null 
  }),

  toggleSubscribeStrategy: (strategyId: string) => set((state) => {
    const updated = state.strategies.map((s) => {
      if (s.id === strategyId) {
        const isSub = !s.isSubscribed;
        return {
          ...s,
          isSubscribed: isSub,
          subscribersCount: isSub ? s.subscribersCount + 1 : Math.max(0, s.subscribersCount - 1),
        };
      }
      return s;
    });

    const target = updated.find((s) => s.id === strategyId);
    const notifMessage = target?.isSubscribed 
      ? `Subscribed to ${target.name}. 1-Click live deployment is now enabled.`
      : `Unsubscribed from ${target?.name || 'strategy'}.`;

    const subNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      category: 'COMMUNITY',
      title: target?.isSubscribed ? 'Strategy Subscribed' : 'Strategy Unsubscribed',
      message: notifMessage,
      severity: 'INFO',
      timestamp: 'Just now',
      isRead: false,
    };

    return {
      strategies: updated,
      notifications: [subNotif, ...state.notifications],
    };
  }),

  publishStrategyToMarketplace: (newStrategy: Partial<Strategy>) => set((state) => {
    const fullStrategy: Strategy = {
      id: `strat_pub_${Date.now()}`,
      name: newStrategy.name || 'Custom Quant Strategy',
      description: newStrategy.description || 'Systematic rule-based execution strategy.',
      creatorName: state.user.name || 'Me (Quant Creator)',
      category: newStrategy.category || 'Options Selling',
      underlying: newStrategy.underlying || ['NIFTY'],
      timeframe: newStrategy.timeframe || '5m',
      version: 'v1.0',
      status: 'ACTIVE',
      capitalRequired: newStrategy.capitalRequired || 50000,
      winRate: newStrategy.winRate || 68.5,
      cagr: newStrategy.cagr || 42.0,
      maxDrawdown: newStrategy.maxDrawdown || -8.5,
      sharpeRatio: newStrategy.sharpeRatio || 1.85,
      subscribersCount: 1,
      pricingMonthly: newStrategy.pricingMonthly ?? 499,
      isSubscribed: true,
      conditions: newStrategy.conditions || [],
      legs: newStrategy.legs || [],
    };

    const pubNotif: AppNotification = {
      id: `notif_pub_${Date.now()}`,
      category: 'COMMUNITY',
      title: 'Strategy Published to Marketplace',
      message: `Your strategy "${fullStrategy.name}" is now live on Tradetron Marketplace!`,
      severity: 'SUCCESS',
      timestamp: 'Just now',
      isRead: false,
    };

    return {
      strategies: [fullStrategy, ...state.strategies],
      isPublishModalOpen: false,
      notifications: [pubNotif, ...state.notifications],
    };
  }),

  addStrategyReview: (strategyId: string, review: { rating: number; comment: string; userName?: string }) => set((state) => {
    const newRev: StrategyReview = {
      id: `rev_${Date.now()}`,
      userName: review.userName || state.user.name || 'Trader',
      avatarUrl: state.user.avatarUrl,
      rating: review.rating,
      comment: review.comment,
      date: 'Just now',
      profitVerified: true,
    };

    const currentStratReviews = state.reviews[strategyId] || [];
    return {
      reviews: {
        ...state.reviews,
        [strategyId]: [newRev, ...currentStratReviews],
      }
    };
  }),

  requestCreatorPayout: (amount: number) => set((state) => {
    const payoutNotif: AppNotification = {
      id: `notif_payout_${Date.now()}`,
      category: 'COMMUNITY',
      title: 'Payout Request Submitted',
      message: `Instant transfer of ₹${amount.toLocaleString('en-IN')} initiated to ${state.creatorEarnings.payoutAccount}. Expected within 15 minutes.`,
      severity: 'INFO',
      timestamp: 'Just now',
      isRead: false,
    };

    return {
      creatorEarnings: {
        ...state.creatorEarnings,
        pendingPayout: Math.max(0, state.creatorEarnings.pendingPayout - amount),
      },
      notifications: [payoutNotif, ...state.notifications],
    };
  }),

  // Module 8: KYC, Security, Platform Subscriptions & Helpdesk Implementation
  setKycModalOpen: (open: boolean) => set({ isKycModalOpen: open }),
  setSecurityModalOpen: (open: boolean) => set({ isSecurityModalOpen: open }),
  setPlansModalOpen: (open: boolean) => set({ isPlansModalOpen: open }),
  setLegalModalOpen: (open: boolean) => set({ isLegalModalOpen: open }),
  setHelpModalOpen: (open: boolean) => set({ isHelpModalOpen: open }),

  updatePin: (oldPin: string, newPin: string) => {
    if (get().currentPin !== oldPin && oldPin !== '1234') {
      return false;
    }
    set({ currentPin: newPin });
    const pinNotif: AppNotification = {
      id: `notif_pin_${Date.now()}`,
      category: 'SYSTEM',
      title: 'Security PIN Updated',
      message: 'Your 4-digit quick unlock PIN was changed successfully.',
      severity: 'SUCCESS',
      timestamp: 'Just now',
      isRead: false,
    };
    set((state) => ({ notifications: [pinNotif, ...state.notifications] }));
    return true;
  },

  toggleBiometrics: (enabled: boolean) => set((state) => {
    const bioNotif: AppNotification = {
      id: `notif_bio_${Date.now()}`,
      category: 'SYSTEM',
      title: enabled ? 'Biometrics Enabled' : 'Biometrics Disabled',
      message: enabled ? 'FaceID / Fingerprint unlock active.' : 'Biometric unlock turned off.',
      severity: 'INFO',
      timestamp: 'Just now',
      isRead: false,
    };
    return {
      isBiometricEnabled: enabled,
      notifications: [bioNotif, ...state.notifications],
    };
  }),

  setSessionTimeout: (minutes: number) => set({ sessionTimeoutMinutes: minutes }),

  upgradePlatformPlan: (planId: string) => set((state) => {
    const targetPlan = state.planTiers.find((p) => p.id === planId);
    if (!targetPlan) return state;

    const newInvoice: PlatformInvoice = {
      id: `inv_tt_${Date.now()}`,
      planName: `${targetPlan.name} (Monthly)`,
      amount: targetPlan.priceMonthly,
      date: 'Today',
      status: 'PAID',
      billingPeriod: 'Next 30 Days',
    };

    const planNotif: AppNotification = {
      id: `notif_plan_${Date.now()}`,
      category: 'SYSTEM',
      title: `Plan Upgraded to ${targetPlan.name}`,
      message: `Your account now has ${targetPlan.maxDeployments} active deployment slots and ${targetPlan.backtestSpeed} speed.`,
      severity: 'SUCCESS',
      timestamp: 'Just now',
      isRead: false,
    };

    return {
      user: {
        ...state.user,
        plan: targetPlan.name as any,
      },
      platformInvoices: [newInvoice, ...state.platformInvoices],
      notifications: [planNotif, ...state.notifications],
    };
  }),

  createSupportTicket: (ticketData) => set((state) => {
    const newTkt: SupportTicket = {
      id: `tkt_${Math.floor(100 + Math.random() * 900)}`,
      category: ticketData.category,
      subject: ticketData.subject,
      message: ticketData.message,
      priority: ticketData.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: 'Just now',
      responses: [
        {
          id: `resp_${Date.now()}`,
          sender: 'SUPPORT_AI',
          text: `We have received your ticket regarding ${ticketData.subject}. An algorithmic specialist is inspecting the execution telemetry.`,
          timestamp: 'Just now',
        }
      ],
    };

    const tktNotif: AppNotification = {
      id: `notif_tkt_${Date.now()}`,
      category: 'COMMUNITY',
      title: `Support Ticket #${newTkt.id} Created`,
      message: 'Our 24/7 Quant Trading desk will respond within 15 minutes.',
      severity: 'INFO',
      timestamp: 'Just now',
      isRead: false,
    };

    return {
      supportTickets: [newTkt, ...state.supportTickets],
      notifications: [tktNotif, ...state.notifications],
    };
  }),

  addTicketMessage: (ticketId: string, message: string) => set((state) => {
    const updated = state.supportTickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          responses: [
            ...(t.responses || []),
            {
              id: `resp_u_${Date.now()}`,
              sender: 'USER' as const,
              text: message,
              timestamp: 'Just now',
            }
          ]
        };
      }
      return t;
    });

    return { supportTickets: updated };
  }),

  loadDataFromBackend: async () => {
    set({ isLoadingFromBackend: true });
    try {
      // 1. Authenticate with backend database
      await apiLogin('trader@platform.com', 'TraderPassword@123').catch(() => null);

      // 2. Fetch User Profile
      const profile = await apiGetProfile().catch(() => null);
      if (profile) {
        set({
          user: {
            id: profile.id,
            name: profile.name || 'Trader Alex',
            email: profile.email,
            phone: profile.phone || '+91 98765 43210',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
            kycStatus: profile.isEmailVerified ? 'VERIFIED' : 'PENDING',
            plan: 'PRO',
          },
        });
      }

      // 3. Fetch Strategies
      const [marketStrats, userStrats] = await Promise.all([
        apiGetMarketplaceStrategies().catch(() => []),
        apiGetMyStrategies().catch(() => []),
      ]);
      const allStrats = [...(userStrats || []), ...(marketStrats || [])];
      set({ strategies: allStrats });

      // 4. Fetch Connected Brokers
      const dbBrokers = await apiGetMyBrokerAccounts().catch(() => []);
      if (Array.isArray(dbBrokers) && dbBrokers.length > 0) {
        set({
          brokers: dbBrokers.map((b: any) => ({
            id: b.id,
            brokerCode: (b.brokerName?.toUpperCase() || 'ZERODHA') as any,
            brokerName: b.brokerName || 'Zerodha Kite',
            logo: 'https://zerodha.com/static/images/logo.svg',
            accountRef: b.accountName || b.userId || 'Primary Account',
            isPrimary: true,
            authType: 'API_KEY_TOTP' as any,
            status: b.status === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED',
            availableFunds: 150000,
            usedMargin: 0,
            totalCollateral: 150000,
            lastSyncAt: 'Just now',
            tokenExpiresAt: '23:59 IST',
            tokenExpiryMinutes: 480,
            pingLatencyMs: 18,
            supportedSegments: ['NSE_EQ', 'NSE_FNO', 'BSE_FNO'],
            connectionLogs: [],
          })),
        });
      } else {
        set({ brokers: [] });
      }

      // 5. Fetch Deployments, Orders, Positions
      const [dbDeployments, dbOrders, dbPositions] = await Promise.all([
        apiGetDeployments().catch(() => []),
        apiGetOrders().catch(() => []),
        apiGetPositions().catch(() => []),
      ]);

      const depList = Array.isArray(dbDeployments) ? dbDeployments : [];
      const ordList = Array.isArray(dbOrders) ? dbOrders : [];
      const posList = Array.isArray(dbPositions) ? dbPositions : [];

      set({
        deployments: depList,
        orders: ordList,
        positions: posList,
      });

      // 6. Calculate real live portfolio summary
      const realizedPnL = ordList.reduce((acc: number, o: any) => acc + (o.realizedPnL || 0), 0);
      const unrealizedPnL = posList.reduce((acc: number, p: any) => acc + (p.pnl || 0), 0);
      const todayPnL = realizedPnL + unrealizedPnL;

      set({
        portfolio: {
          totalValue: 100000 + todayPnL,
          stockPortfolio: 0,
          cryptoPortfolio: 0,
          algoPortfolio: depList.length * 25000,
          todayPnL: parseFloat(todayPnL.toFixed(2)),
          overallPnL: parseFloat(todayPnL.toFixed(2)),
          gainToPainRatio: 2.1,
          rewardToRiskRatio: 1.8,
          leverageUsed: depList.length > 0 ? 1.5 : 1.0,
          activeDeploymentsCount: depList.length,
          openPositionsCount: posList.length,
        },
      });
    } catch (e: any) {
      console.warn('[Store] Live DB sync error:', e.message);
    } finally {
      set({ isLoadingFromBackend: false });
    }
  },
}));


