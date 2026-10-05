export type UserRole = 'trader' | 'creator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export type BrokerCode = 'ZERODHA' | 'UPSTOX' | 'ANGELONE' | 'DHAN' | 'FYERS';
export type BrokerAuthType = 'OAUTH' | 'API_KEY_TOTP' | 'SMART_API';

export interface BrokerLogEvent {
  id: string;
  type: 'AUTH_SUCCESS' | 'TOKEN_REFRESH' | 'MARGIN_SYNC' | 'HEARTBEAT' | 'ERROR';
  message: string;
  timestamp: string;
}

export interface BrokerAccount {
  id: string;
  brokerCode: BrokerCode;
  brokerName: string;
  logo: string;
  accountRef: string;
  isPrimary?: boolean;
  authType: BrokerAuthType;
  status: 'CONNECTED' | 'TOKEN_EXPIRED' | 'DISCONNECTED' | 'ERROR';
  availableFunds: number;
  usedMargin: number;
  totalCollateral: number;
  lastSyncAt: string;
  tokenExpiresAt: string;
  tokenExpiryMinutes: number;
  pingLatencyMs: number;
  supportedSegments: string[];
  connectionLogs: BrokerLogEvent[];
}

export interface MarketIndexQuote {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  sparkline: number[];
}

export interface OptionStrikeRow {
  strikePrice: number;
  isAtm?: boolean;
  call: {
    ltp: number;
    changePercent: number;
    oi: number;
    iv: number;
    volume: number;
  };
  put: {
    ltp: number;
    changePercent: number;
    oi: number;
    iv: number;
    volume: number;
  };
}

export type IndicatorType = 'RSI' | 'SMA' | 'EMA' | 'MACD' | 'VWAP' | 'SUPER_TREND' | 'BOLLINGER_BANDS' | 'ATR';

export interface StrategyCondition {
  id: string;
  leftOperand: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below' | 'in_range';
  rightOperand: string;
}

export interface StrategyLeg {
  id: string;
  instrument: string;
  segment: 'OPT' | 'FUT' | 'EQ';
  optionType?: 'CE' | 'PE';
  strikeOffset?: 'ATM' | 'ITM1' | 'ITM2' | 'OTM1' | 'OTM2';
  expiry: 'CURRENT_WEEK' | 'NEXT_WEEK' | 'MONTHLY';
  action: 'BUY' | 'SELL';
  lots: number;
  stopLossPercent?: number;
  targetPercent?: number;
}

export interface BacktestTrade {
  id: string;
  entryDate: string;
  exitDate: string;
  type: 'BUY' | 'SELL';
  pnl: number;
  pnlPercent: number;
  exitReason: 'TARGET' | 'STOP_LOSS' | 'TIME_EXIT' | 'SIGNAL';
}

export interface BacktestResult {
  strategyId: string;
  period: '1M' | '3M' | '6M' | '1Y';
  initialCapital: number;
  totalPnL: number;
  pnlPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  equityCurve: number[];
  monthlyPnL: Array<{ month: string; pnl: number }>;
  recentTrades: BacktestTrade[];
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  creatorAvatar?: string;
  category: 'Options Buying' | 'Options Selling' | 'Intraday Trend' | 'Scalping' | 'Directional';
  underlying: string[];
  timeframe: string;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'ARCHIVED';
  capitalRequired: number;
  winRate: number;
  cagr: number;
  maxDrawdown: number;
  sharpeRatio: number;
  subscribersCount: number;
  pricingMonthly: number;
  isSubscribed?: boolean;
  conditions: StrategyCondition[];
  exitConditions?: StrategyCondition[];
  legs: StrategyLeg[];
  targetProfit?: number;
  stopLoss?: number;
  trailingSl?: { activateAt: number; trailBy: number };
  startTime?: string;
  squareOffTime?: string;
  maxReentries?: number;
  lastBacktest?: BacktestResult;
}

export interface DeploymentAuditLog {
  id: string;
  timestamp: string;
  type: 'SIGNAL' | 'ORDER_PLACED' | 'ORDER_FILLED' | 'REPAIR' | 'SL_TRIGGER' | 'SQUARE_OFF' | 'ERROR';
  message: string;
  details?: string;
}

export interface Deployment {
  id: string;
  strategyId: string;
  strategyName: string;
  mode: 'PAPER' | 'LIVE';
  brokerAccountId: string;
  brokerName: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'ERROR';
  multiplier: number;
  deployedAt: string;
  todayPnL: number;
  overallPnL: number;
  todayPnLPercent: number;
  maxLossLimit?: number;
  targetProfitLimit?: number;
  activeLegsCount: number;
  lastSignal?: string;
  orderType?: 'MARKET' | 'LIMIT' | 'SL_M';
  executionMode?: 'AUTO' | 'MANUAL_APPROVAL';
  capitalAllocated?: number;
  multiBrokers?: Array<{ brokerId: string; brokerName: string; multiplier: number }>;
  auditLogs?: DeploymentAuditLog[];
}

export interface Position {
  id: string;
  deploymentId: string;
  strategyName: string;
  instrument: string;
  symbol: string;
  segment: 'OPT' | 'FUT' | 'EQ';
  side: 'BUY' | 'SELL';
  qty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Order {
  id: string;
  deploymentId: string;
  strategyName: string;
  brokerOrderId: string;
  instrument: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  qty: number;
  price: number;
  status: 'EXECUTED' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  timestamp: string;
}

export interface PortfolioSummary {
  totalValue: number;
  stockPortfolio: number;
  cryptoPortfolio: number;
  algoPortfolio: number;
  todayPnL: number;
  overallPnL: number;
  gainToPainRatio: number;
  rewardToRiskRatio: number;
  leverageUsed: number;
  activeDeploymentsCount: number;
  openPositionsCount: number;
}

export type NotificationCategory = 'EXECUTION' | 'RISK_ALERT' | 'MARGIN' | 'SYSTEM' | 'COMMUNITY';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface NotificationPreferences {
  orderFilledPush: boolean;
  stopLossTriggeredPush: boolean;
  targetHitPush: boolean;
  marginWarningPush: boolean;
  tokenExpiryPush: boolean;
  telegramAlerts: boolean;
  whatsappAlerts: boolean;
  webhookEndpoint?: string;
}

// Module 7: Marketplace Monetization, Creator Studio & Copy-Trading
export interface StrategyReview {
  id: string;
  userName: string;
  avatarUrl?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  profitVerified?: boolean;
}

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  sebiRegistration?: string;
  totalSubscribers: number;
  totalAumDeployed: number;
  activeStrategiesCount: number;
  avgWinRate: number;
  avgSharpeRatio: number;
  rank: number;
  earningsMonthly: number;
}

export interface CreatorEarningsSummary {
  totalRevenue: number;
  thisMonthEarnings: number;
  activeSubscribers: number;
  pendingPayout: number;
  nextPayoutDate: string;
  payoutAccount: string;
  invoices: Array<{
    id: string;
    strategyName: string;
    subscriberName: string;
    amount: number;
    date: string;
    status: 'PAID' | 'PROCESSING';
  }>;
}

// Module 8: KYC, Security, Platform Subscriptions & Helpdesk
export interface UserKYC {
  panNumber: string;
  aadhaarMasked: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedDate: string;
  dematId: string;
  bankAccount: string;
  sebiComplianceConsent: boolean;
}

export interface SupportTicket {
  id: string;
  category: 'BROKER_API' | 'ORDER_EXECUTION' | 'BILLING' | 'WEBHOOK' | 'STRATEGY_BUILDER' | 'OTHER';
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  responses?: Array<{ id: string; sender: 'USER' | 'SUPPORT_AI' | 'AGENT'; text: string; timestamp: string }>;
}

export interface TradetronPlanTier {
  id: string;
  name: string;
  priceMonthly: number;
  maxDeployments: number;
  multiBroker: boolean;
  maxWebhooks: number;
  backtestSpeed: string;
  features: string[];
  isPopular?: boolean;
}

export interface PlatformInvoice {
  id: string;
  planName: string;
  amount: number;
  date: string;
  status: 'PAID' | 'FAILED';
  billingPeriod: string;
}

