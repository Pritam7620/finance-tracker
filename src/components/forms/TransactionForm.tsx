
import { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTransactions } from '@/hooks/useTransactions';

interface TransactionFormProps {
  onClose: () => void;
}

export const TransactionForm = ({ onClose }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const { createTransaction, isCreating } = useTransactions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createTransaction({
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      type: formData.type as 'income' | 'expense',
      date: formData.date,
      notes: formData.notes || undefined
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Add Transaction</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-900 dark:text-white">Title</Label>
              <Input
                id="title"
                placeholder="Transaction title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-gray-900 dark:text-white">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-gray-900 dark:text-white">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="income" className="text-gray-900 dark:text-white">Income</SelectItem>
                  <SelectItem value="expense" className="text-gray-900 dark:text-white">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-900 dark:text-white">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="Food" className="text-gray-900 dark:text-white">Food</SelectItem>
                  <SelectItem value="Transport" className="text-gray-900 dark:text-white">Transport</SelectItem>
                  <SelectItem value="Entertainment" className="text-gray-900 dark:text-white">Entertainment</SelectItem>
                  <SelectItem value="Shopping" className="text-gray-900 dark:text-white">Shopping</SelectItem>
                  <SelectItem value="Bills" className="text-gray-900 dark:text-white">Bills</SelectItem>
                  <SelectItem value="Income" className="text-gray-900 dark:text-white">Income</SelectItem>
                  <SelectItem value="Other" className="text-gray-900 dark:text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="text-gray-900 dark:text-white">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-900 dark:text-white">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={isCreating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isCreating ? 'Adding...' : 'Add Transaction'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
