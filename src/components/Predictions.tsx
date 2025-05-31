
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePredictions } from '@/hooks/usePredictions';

export const Predictions = () => {
  const { predictions, isLoading } = usePredictions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading predictions...</div>
      </div>
    );
  }

  const {
    monthlyProjection,
    savingsGoal,
    budgetAlerts,
    spendingTrends
  } = predictions;

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-red-600 dark:text-red-400';
      case 'decreasing': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Predictions</h1>
      </div>

      {/* Savings Goal Card */}
      {savingsGoal && (
        <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Target className="h-5 w-5" />
              Savings Goal Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Current Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ${savingsGoal.currentMonthlySavings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Projected Yearly Savings</p>
                  <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                    ${savingsGoal.projectedYearlySavings.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600 dark:text-green-400">Savings Rate Progress</span>
                    <Badge variant={savingsGoal.onTrack ? 'default' : 'secondary'}>
                      {savingsGoal.onTrack ? 'On Track' : 'Behind Target'}
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.min((savingsGoal.currentMonthlySavings / savingsGoal.targetSavings) * 100, 100)} 
                    className="h-3"
                  />
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Target: ${savingsGoal.targetSavings.toLocaleString()} (20% of income)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAlerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                    'bg-green-50 dark:bg-green-900/20 border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      alert.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                      alert.severity === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-green-700 dark:text-green-300'
                    }`}>
                      {alert.message}
                    </p>
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'secondary' : 'default'
                    }>
                      {alert.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Projection */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              3-Month Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyProjection.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyProjection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedIncome" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name="Projected Income" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedExpenses" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    name="Projected Expenses" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedSavings" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    name="Projected Savings" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Not enough data for projections
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Trends */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Spending Trends by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spendingTrends.length > 0 ? (
              <div className="space-y-4">
                {spendingTrends.slice(0, 6).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{trend.category}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avg: ${trend.averageSpending.toLocaleString()}/month
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.direction)}
                      <span className={`text-sm font-medium ${getTrendColor(trend.direction)}`}>
                        {Math.abs(trend.trend)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Not enough data for trend analysis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Target className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Cost Optimization</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Consider reducing spending in your highest expense categories
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Review recurring subscriptions and memberships
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Look for bulk purchase opportunities in frequent categories
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Savings Strategies</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Automate transfers to your savings account
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Consider the 50/30/20 budgeting rule
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Set up an emergency fund target
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
