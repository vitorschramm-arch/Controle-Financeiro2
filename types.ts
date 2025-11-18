
export enum Screen {
  Dashboard,
  Transactions,
  Investments,
  Profile,
  AddTransaction,
  BalanceDetails,
  CategoryDetails,
  Planning,
  Reports,
  CardManagement,
  RecurringItems,
  RecurringTransactions,
}

export type ScreenProps = {
  navigateTo: (screen: Screen, context?: any) => void;
  context?: any;
};

export type TransactionType = 'income' | 'expense' | 'investment';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  subcategory?: string;
  paymentMethod: string;
  cardId?: string;
  investmentId?: string;
  recurringItemId?: string;
  recurringTransactionId?: string;
  installments?: number;
}

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: string; // Ex: "100 Ações" ou "0.025 BTC"
  value: number; // Valor total atual
  categoryId?: string;
}

export interface Category {
    id: string;
    name: string;
    budget: number;
    icon: string;
    parentId?: string;
    type: 'income' | 'expense' | 'investment';
}

export interface Goal {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    targetDate: string; // YYYY-MM-DD
    imageUrl?: string;
}

export interface CreditCard {
    id: string;
    name: string;
    bank: string;
    last4: string;
    limit: number;
    closingDay: number; // 1-31
    dueDay: number; // 1-31
    color: string;
}

export type FrequencyUnit = 'weeks' | 'months' | 'years';

export interface RecurringItem {
    id: string;
    name: string;
    brand?: string;
    store?: string;
    categoryId: string; // The ID of the parent category
    subcategoryId?: string; // The ID of the subcategory
    estimatedCost: number;
    startDate: string; // YYYY-MM-DD
    frequencyValue: number;
    frequencyUnit: FrequencyUnit;
}

export interface RecurringTransaction {
    id:string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    startDate: string; // YYYY-MM-DD
    frequencyValue: number;
    frequencyUnit: FrequencyUnit;
}

export interface DismissedForecast {
    // FIX: Add 'id' property to align with Firestore document structure and satisfy the generic constraint in `mapDocToData`.
    id: string;
    itemId: string; // ID of RecurringItem or RecurringTransaction
    month: number; // 0-11
    year: number;
}
