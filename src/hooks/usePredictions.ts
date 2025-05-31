
import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useBudgets } from './useBudgets';

export const usePredictions = () => {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { budgets, isLoading: budgetsLoading } = useBudgets();

  const predictions = useMemo(() => {
    if (!transactions.length) {
      return {
        monthlyProjection: [],
        savingsGoal: null,
        budgetAlerts: [],
        spendingTrends: []
      };
    }

    // Calculate average monthly spending by category (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= threeMonthsAgo && t.type === 'expense'
    );

    const categoryAverages = new Map();
    recentTransactions.forEach(t => {
      const current = categoryAverages.get(t.category) || [];
      current.push(Number(t.amount));
      categoryAverages.set(t.category, current);
    });

    // Monthly projection (next 3 months)
    const monthlyProjection = [];
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      let projectedExpenses = 0;
      categoryAverages.forEach((amounts) => {
        const average = amounts.reduce((sum, amount) => sum + amount, 0) / 3; // 3 months average
        projectedExpenses += average;
      });

      // Assume income stays similar to last month
      const lastMonthIncome = transactions
        .filter(t => {
          const transDate = new Date(t.date);
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return transDate.getMonth() === lastMonth.getMonth() && 
                 transDate.getFullYear() === lastMonth.getFullYear() &&
                 t.type === 'income';
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyProjection.push({
        month: futureDate.toLocaleDateString('en-US', { month: 'short' }),
        projectedIncome: lastMonthIncome,
        projectedExpenses: Math.round(projectedExpenses),
        projectedSavings: Math.round(lastMonthIncome - projectedExpenses)
      });
    }

    // Budget alerts
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthExpenses = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear &&
             t.type === 'expense';
    });

    const budgetAlerts = budgets.map(budget => {
      const spent = currentMonthExpenses
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = (spent / Number(budget.monthly_limit)) * 100;
      
      let severity: 'low' | 'medium' | 'high' = 'low';
      let message = '';

      if (percentage >= 100) {
        severity = 'high';
        message = `You've exceeded your ${budget.category} budget by $${Math.round(spent - Number(budget.monthly_limit))}`;
      } else if (percentage >= 80) {
        severity = 'medium';
        message = `You're at ${Math.round(percentage)}% of your ${budget.category} budget`;
      } else if (percentage >= 60) {
        severity = 'low';
        message = `You're on track with your ${budget.category} budget (${Math.round(percentage)}% used)`;
      }

      return {
        category: budget.category,
        severity,
        message,
        percentage
      };
    }).filter(alert => alert.message);

    // Spending trends
    const spendingTrends = Array.from(categoryAverages.entries()).map(([category, amounts]) => {
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const trend = amounts.length > 1 ? 
        ((amounts[amounts.length - 1] - amounts[0]) / amounts[0]) * 100 : 0;

      return {
        category,
        averageSpending: Math.round(average),
        trend: Math.round(trend),
        direction: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable'
      };
    }).sort((a, b) => b.averageSpending - a.averageSpending);

    // Savings goal projection
    const totalMonthlyIncome = transactions
      .filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && 
               transDate.getFullYear() === currentYear &&
               t.type === 'income';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalMonthlyExpenses = currentMonthExpenses
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
    const savingsGoal = {
      currentMonthlySavings: monthlySavings,
      projectedYearlySavings: monthlySavings * 12,
      recommendedSavingsRate: 0.2, // 20%
      targetSavings: totalMonthlyIncome * 0.2,
      onTrack: monthlySavings >= (totalMonthlyIncome * 0.2)
    };

    return {
      monthlyProjection,
      savingsGoal,
      budgetAlerts,
      spendingTrends
    };
  }, [transactions, budgets]);

  return {
    predictions,
    isLoading: transactionsLoading || budgetsLoading
  };
};
