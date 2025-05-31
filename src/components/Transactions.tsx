
import { useState } from 'react';
import { Plus, Filter, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TransactionForm } from './forms/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const Transactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { transactions, isLoading } = useTransactions();
  const { toast } = useToast();

  const handleDelete = async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Transaction deleted',
        description: 'Your transaction has been successfully deleted.',
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Categories</SelectItem>
                <SelectItem value="Food" className="text-gray-900 dark:text-white">Food</SelectItem>
                <SelectItem value="Transport" className="text-gray-900 dark:text-white">Transport</SelectItem>
                <SelectItem value="Entertainment" className="text-gray-900 dark:text-white">Entertainment</SelectItem>
                <SelectItem value="Income" className="text-gray-900 dark:text-white">Income</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Types</SelectItem>
                <SelectItem value="income" className="text-gray-900 dark:text-white">Income</SelectItem>
                <SelectItem value="expense" className="text-gray-900 dark:text-white">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No transactions found. Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{transaction.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {transaction.category}
                      </Badge>
                    </div>
                    {transaction.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{transaction.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}{Number(transaction.amount).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <TransactionForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};
