
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { budgets, isLoading: budgetsLoading } = useBudgets();

  const dashboardData = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        savings: 0,
        monthlyData: [],
        categoryData: [],
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate totals for current month
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savings = totalIncome - totalExpenses;

    // Generate monthly data for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyData.push({
        month,
        income,
        expenses,
        savings: income - expenses,
      });
    }

    // Generate category data for expenses
    const expensesByCategory = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const categoryData = Object.entries(expensesByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .slice(0, 5); // Top 5 categories

    return {
      totalIncome,
      totalExpenses,
      savings,
      monthlyData,
      categoryData,
    };
  }, [transactions]);

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading your financial data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white-900">Dashboard</h1>
        <div className="text-sm text-white-700">Welcome back, {userName}!</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalIncome.toLocaleString()}</div>
            <p className="text-xs opacity-90">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-400 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs opacity-90">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Net Savings</CardTitle>
            <PiggyBank className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.savings.toLocaleString()}</div>
            <p className="text-xs opacity-90">
              {dashboardData.totalIncome > 0 
                ? `${((dashboardData.savings / dashboardData.totalIncome) * 100).toFixed(1)}% of income`
                : 'No income recorded'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Budgets</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs opacity-90">Categories tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white-900">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} name="Savings" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No transaction data available. Start by adding some transactions!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white-900">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No expense data available. Start by adding some expense transactions!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {transactions.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold text-white-900 mb-2">Get Started with Your Finance Tracking</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first transaction to see your financial data come to life!
            </p>
            <div className="text-sm text-gray-500">
              Navigate to the Transactions tab to add income and expense records.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
