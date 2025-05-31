
import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useBudgets } from './useBudgets';

export const useAnalytics = () => {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { budgets, isLoading: budgetsLoading } = useBudgets();

  const analytics = useMemo(() => {
    if (!transactions.length) {
      return {
        monthlyTrends: [],
        categoryBreakdown: [],
        incomeVsExpenses: [],
        topCategories: [],
        spendingByCategory: [],
        budgetComparison: []
      };
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === date.getMonth() && 
               transDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
        net: income - expenses
      });
    }

    // Category breakdown
    const categoryMap = new Map();
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Number(t.amount));
      }
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Income vs Expenses (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeVsExpenses = [
      { name: 'Income', value: totalIncome, color: '#10b981' },
      { name: 'Expenses', value: totalExpenses, color: '#ef4444' }
    ];

    // Budget comparison
    const budgetComparison = budgets.map(budget => {
      const spent = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        category: budget.category,
        budgeted: Number(budget.monthly_limit),
        spent,
        remaining: Math.max(Number(budget.monthly_limit) - spent, 0),
        percentage: Math.min((spent / Number(budget.monthly_limit)) * 100, 100)
      };
    });

    return {
      monthlyTrends,
      categoryBreakdown,
      incomeVsExpenses,
      topCategories: categoryBreakdown,
      spendingByCategory: categoryBreakdown,
      budgetComparison
    };
  }, [transactions, budgets]);

  return {
    analytics,
    isLoading: transactionsLoading || budgetsLoading
  };
};
