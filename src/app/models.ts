export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  spentMoney: number;
  salary?: number;
  dailyAllowance?: number;
  payday?: number;
}

export interface ActivityParticipant {
  id: string;
  totalMoneyPerUser: number;
  userId: string;
}

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activityParticipants?: ActivityParticipant[];
  totalMoney: number;
  payerId: string;
}

export interface TripParticipant {
  userId: string;
  isPaid: boolean;
  totalMoneyPerUser: number;
  paidAmount: number;
}

export interface TripPayer {
  userId: string;
  spentMoney: number;
}

export interface PaymentHistory {
  id: string;
  tripId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}

export type TripStatus = "planed" | "on-going" | "ended";

export interface Trip {
  id: string;
  name: string;
  date: string;
  tripParticipants: TripParticipant[];
  tripPayers: TripPayer[];
  status: TripStatus;
  totalMoney: number;
  moneyPerUser: number;
  activities: TripActivity[];
  paymentHistory: string[];
}

export interface TripActivity {
  id: string;
  name: string;
  tripId: string;
  payerId: string;
  createdAt: string;
  updatedAt: string;
  totalMoney: number;
}

export interface NewActivityPayload {
  tripId: string;
  name: string;
  totalMoney: number;
  payerId: string;
  participants: ActivityParticipant[];
}

// Smart Saving Planner Models
export type FrequencyType = "monthly" | "weekly";
export type SavingPlanType = "send_home" | "saving" | "investing";

export interface FixedExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: FrequencyType;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  creditor: string;
  amountRemaining: number;
  monthlyPayment: number;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  borrower: string;
  amountRemaining: number;
  monthlyCollect: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingPlan {
  id: string;
  userId: string;
  type: SavingPlanType;
  percentageOfSalary?: number;
  fixedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailySpendingLog {
  id: string;
  userId: string;
  date: string;
  amountSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Create/Update payload interfaces
export interface CreateFixedExpensePayload {
  name: string;
  amount: number;
  frequency: FrequencyType;
}

export interface CreateDebtPayload {
  creditor: string;
  amountRemaining: number;
  monthlyPayment: number;
}

export interface CreateLoanPayload {
  borrower: string;
  amountRemaining: number;
  monthlyCollect: number;
}

export interface CreateSavingPlanPayload {
  type: SavingPlanType;
  percentageOfSalary?: number;
  fixedAmount?: number;
}

export interface CreateDailySpendingLogPayload {
  date: string;
  amountSpent: number;
}

export interface UpdateUserSalaryPayload {
  salary: number;
}

// Dashboard summary interface
export interface SavingPlannerSummary {
  totalFixedExpenses: number;
  totalMonthlyDebtPayment: number;
  totalMonthlyLoanIncome: number;
  totalMonthlySavingPlan: number;
  dailyAllowance: number;
  currentMonthSpending: number;
  remainingDailyBudget: number;
}
