
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: budgets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('category');

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  const createBudget = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Budget created',
        description: 'Your budget has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create budget. Please try again.',
        variant: 'destructive',
      });
      console.error('Budget creation error:', error);
    },
  });

  return {
    budgets,
    isLoading,
    error,
    createBudget: createBudget.mutate,
    isCreating: createBudget.isPending,
  };
};
