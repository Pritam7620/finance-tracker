
import { useState } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetForm } from './forms/BudgetForm';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useMemo } from 'react';

export const Budgets = () => {
  const [showForm, setShowForm] = useState(false);
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  const budgetData = useMemo(() => {
    if (!budgets.length || !transactions.length) {
      return budgets.map(budget => ({
        ...budget,
        spent: 0,
        remaining: Number(budget.monthly_limit),
        percentage: 0,
      }));
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    return budgets.map(budget => {
      const spent = currentMonthExpenses
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const limit = Number(budget.monthly_limit);
      const remaining = Math.max(limit - spent, 0);
      const percentage = Math.min((spent / limit) * 100, 100);

      return {
        ...budget,
        spent,
        remaining,
        percentage,
      };
    });
  }, [budgets, transactions]);

  const totals = useMemo(() => {
    const totalBudget = budgetData.reduce((sum, b) => sum + Number(b.monthly_limit), 0);
    const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgetData.reduce((sum, b) => sum + b.remaining, 0);

    return { totalBudget, totalSpent, totalRemaining };
  }, [budgetData]);

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', icon: AlertTriangle, color: 'text-red-500' };
    if (percentage >= 80) return { status: 'warning', icon: AlertTriangle, color: 'text-yellow-500' };
    return { status: 'good', icon: CheckCircle, color: 'text-green-500' };
  };

  if (budgetsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading your budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Budget Planning</h1>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {budgetData.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Budgets Set</h3>
            <p className="text-gray-600 mb-4">
              Create your first budget to start tracking your spending limits by category.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetData.map((budget) => {
              const { status, icon: StatusIcon, color } = getBudgetStatus(budget.spent, Number(budget.monthly_limit));
              
              return (
                <Card key={budget.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">{budget.category}</CardTitle>
                    <StatusIcon className={`h-4 w-4 ${color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">${budget.spent.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/ ${Number(budget.monthly_limit).toLocaleString()}</span>
                      </div>
                      
                      <Progress value={budget.percentage} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {status === 'exceeded' ? 'Over budget by' : 'Remaining'}: ${Math.abs(budget.remaining).toLocaleString()}
                        </span>
                        <Badge variant={status === 'exceeded' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}>
                          {budget.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      
                      {status === 'exceeded' && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs text-red-700 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Budget exceeded! Consider reducing spending.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-xl font-bold text-green-600">${totals.totalBudget.toLocaleString()}</div>
                    <div className="text-sm text-green-700">Total Budget</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">${totals.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Total Spent</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">${totals.totalRemaining.toLocaleString()}</div>
                    <div className="text-sm text-purple-700">Remaining</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Set realistic budgets based on your past spending patterns
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Review and adjust your budgets monthly
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showForm && (
        <BudgetForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};
