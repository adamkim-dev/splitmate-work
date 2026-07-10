import { Debt, Loan, SavingPlan, SavingPlannerSummary } from "../../models";
import useUsers from "../../hooks/useUsers";
import { Utility } from "../../utils";

type Props = {
  summary?: SavingPlannerSummary;
  debts: Debt[];
  loans: Loan[];
  savingPlans: SavingPlan[];
  userId: string;
  dailyBudgetX: number | null;
  setDailyBudgetX: (v: number | null) => void;
};

export default function OverviewTab({
  summary,
  debts,
  loans,
  savingPlans,
  userId,
  dailyBudgetX,
  setDailyBudgetX,
}: Props) {
  const { getUserById } = useUsers();

  const daysUntilNextPayday = () => {
    const user = userId ? getUserById(userId) : undefined;
    const payday = user?.payday;
    if (!payday || payday < 1 || payday > 31) {
      // fallback: số ngày còn lại trong tháng
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return end.getDate() - now.getDate() + 1; // bao gồm hôm nay
    }
    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const thisPayday = new Date(today.getFullYear(), today.getMonth(), payday);
    thisPayday.setHours(0, 0, 0, 0);
    let next = thisPayday;
    if (todayMid > thisPayday) {
      next = new Date(today.getFullYear(), today.getMonth() + 1, payday);
    }
    const ms = next.getTime() - todayMid.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  const cycleDays = daysUntilNextPayday();
  const allowance = summary?.dailyAllowance ?? 0;
  const savingPlanMonthly = summary?.totalMonthlySavingPlan ?? 0;
  // Allowance đã trừ Saving Plan, nên khuyến nghị X = allowance
  const recommendedX = Math.max(0, allowance);
  const budgetX = dailyBudgetX ?? recommendedX;
  // Tiết kiệm dự kiến = Saving Plan + phần dư nếu chi tiêu < allowance
  const projectedSavings =
    savingPlanMonthly + Math.max(0, (allowance - budgetX) * cycleDays);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Monthly Loan Income
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${Utility.formatMoney(summary?.totalMonthlyLoanIncome ?? 0)}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="text-sm text-green-600 font-medium mb-1">
            Daily Allowance
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${Utility.formatMoney(summary?.dailyAllowance ?? 0)}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="text-sm text-red-600 font-medium mb-1">
            Total Fixed Expenses
          </div>
          <div className="text-2xl font-bold text-red-900">
            ${Utility.formatMoney(summary?.totalFixedExpenses ?? 0)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Total Monthly Saving Plan
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ${Utility.formatMoney(summary?.totalMonthlySavingPlan ?? 0)}
          </div>
        </div>
      </div>

      {/* Điều khiển ngân sách và hiển thị tiết kiệm dự kiến */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Budget Control ($/day)</h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            placeholder="Enter your daily budget ($/day)"
            className="w-60 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={budgetX.toFixed(2) || 0}
            onChange={(e) => {
              const v = e.target.value;
              const num = v ? parseFloat(v) : 0;
              setDailyBudgetX(
                Number.isFinite(num) ? Number(Math.max(0, num).toFixed(2)) : 0
              );
            }}
          />
          <div className="text-sm text-gray-600">
            Current Recommendation: ${Utility.formatMoney(recommendedX)}/day
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">
              Số tiền hiện tại
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${Utility.formatMoney(summary?.remainingDailyBudget ?? 0)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Số dư còn lại đến kỳ lương (sau các khoản đã chi)
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">
              Tiết kiệm dự kiến đến kỳ lương
            </div>
            <div className="text-2xl font-bold text-purple-900">
              ${Utility.formatMoney(projectedSavings)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              X = ${Utility.formatMoney(budgetX)}$/ngày • còn {cycleDays} ngày
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">
              Chi tiêu tháng hiện tại
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${Utility.formatMoney(summary?.currentMonthSpending ?? 0)}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Chỉnh X sẽ cập nhật lịch chi tiêu và số tiền tiết kiệm dự kiến.
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Active Debts</h4>
          <div className="text-2xl font-bold text-red-600">{debts.length}</div>
          <div className="text-sm text-gray-500">
            Total: $
            {Utility.formatMoney(
              debts.reduce(
                (sum: number, debt: Debt) => sum + debt.amountRemaining,
                0
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Active Loans</h4>
          <div className="text-2xl font-bold text-green-600">
            {loans.length}
          </div>
          <div className="text-sm text-gray-500">
            Total: $
            {Utility.formatMoney(
              loans.reduce(
                (sum: number, loan: Loan) => sum + loan.amountRemaining,
                0
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Saving Plans</h4>
          <div className="text-2xl font-bold text-purple-600">
            {savingPlans.length}
          </div>
          <div className="text-sm text-gray-500">Active goals</div>
        </div>
      </div>
    </div>
  );
}
