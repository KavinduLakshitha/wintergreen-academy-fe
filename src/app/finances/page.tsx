'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  Plus, 
  Search, 
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Import services and types
import {
  Transaction,
  Budget,
  TransactionStatistics,
  BudgetStatistics,
  CreateTransactionData,
  UpdateTransactionData,
  CreateBudgetData,
  UpdateBudgetData,
  getTransactions,
  getBudgets,
  getTransactionStatistics,
  getBudgetStatistics,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createBudget,
  updateBudget,
  deleteBudget,
  refreshBudget
} from '@/services/financeService';

import { getStudents, Student } from '@/services/studentService';

interface User {
  _id: string;
  fullName: string;
  username: string;
  role: 'superAdmin' | 'admin' | 'moderator' | 'staff';
  branch?: {
    _id: string;
    name: string;
  };
}

const FinanceManagement = () => {
  const router = useRouter();
  
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactionStats, setTransactionStats] = useState<TransactionStatistics | null>(null);
  const [budgetStats, setBudgetStats] = useState<BudgetStatistics | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  
  // Dialog states
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Filter states
  const [transactionFilters, setTransactionFilters] = useState({
    search: '',
    type: '',
    category: '',
    status: '',
    page: 1,
    limit: 10
  });

  const [budgetFilters, setBudgetFilters] = useState({
    search: '',
    category: '',
    period: '',
    status: '',
    page: 1,
    limit: 10
  });

  // Category options based on transaction type
  const incomeCategories = [
    'Tuition Fees',
    'Registration Fees',
    'Examination Fees',
    'Certificate Fees',
    'Late Payment Fees',
    'Material Fees',
    'Lab Fees',
    'Other Income'
  ];

  const expenseCategories = [
    'Office Supplies',
    'Equipment',
    'Utilities',
    'Rent',
    'Salaries',
    'Marketing',
    'Training Materials',
    'Maintenance',
    'Insurance',
    'Transportation',
    'Communication',
    'Other Expenses'
  ];

  // Get categories based on selected transaction type
  const getAvailableCategories = () => {
    if (transactionFilters.type === 'income') {
      return incomeCategories;
    } else if (transactionFilters.type === 'expense') {
      return expenseCategories;
    }
    return [...incomeCategories, ...expenseCategories];
  };

  // Check authentication and get user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const userData = JSON.parse(userInfo);
      setUser(userData);
      
      // Check if user has permission to access finance management
      if (!['superAdmin', 'admin'].includes(userData.role)) {
        toast.error('You do not have permission to access finance management');
        router.push('/dashboard');
        return;
      }
    }
  }, [router]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Auto-reload transactions when filters change
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        loadTransactions();
      }, 300); // Debounce search input

      return () => clearTimeout(timeoutId);
    }
  }, [transactionFilters, user]);

  // Auto-reload budgets when filters change
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        loadBudgets();
      }, 300); // Debounce search input

      return () => clearTimeout(timeoutId);
    }
  }, [budgetFilters, user]);

  // Reset category filter when transaction type changes
  useEffect(() => {
    if (transactionFilters.category) {
      const availableCategories = getAvailableCategories();
      if (!availableCategories.includes(transactionFilters.category)) {
        setTransactionFilters(prev => ({ ...prev, category: '' }));
      }
    }
  }, [transactionFilters.type]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadBudgets(),
        loadStudents(),
        loadTransactionStatistics(),
        loadBudgetStatistics()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setTransactionsLoading(true);
    try {
      // Prepare filters with proper typing
      const filters = {
        ...transactionFilters,
        type: transactionFilters.type === 'income' || transactionFilters.type === 'expense'
          ? transactionFilters.type as 'income' | 'expense'
          : undefined,
        status: transactionFilters.status === 'pending' || transactionFilters.status === 'completed' || transactionFilters.status === 'cancelled'
          ? transactionFilters.status as 'pending' | 'completed' | 'cancelled'
          : undefined
      };

      const result = await getTransactions(filters);
      if (result) {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadBudgets = async () => {
    setBudgetsLoading(true);
    try {
      // Prepare filters with proper typing
      const filters = {
        ...budgetFilters,
        period: budgetFilters.period === 'monthly' || budgetFilters.period === 'quarterly' || budgetFilters.period === 'yearly'
          ? budgetFilters.period as 'monthly' | 'quarterly' | 'yearly'
          : undefined,
        status: budgetFilters.status === 'active' || budgetFilters.status === 'inactive' || budgetFilters.status === 'completed' || budgetFilters.status === 'exceeded'
          ? budgetFilters.status as 'active' | 'inactive' | 'completed' | 'exceeded'
          : undefined
      };

      const result = await getBudgets(filters);
      if (result) {
        setBudgets(result.budgets);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setBudgetsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const result = await getStudents({ limit: 1000 }); // Get all students for dropdown
      if (result) {
        setStudents(result.students);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadTransactionStatistics = async () => {
    try {
      const stats = await getTransactionStatistics();
      setTransactionStats(stats);
    } catch (error) {
      console.error('Error loading transaction statistics:', error);
    }
  };

  const loadBudgetStatistics = async () => {
    try {
      const stats = await getBudgetStatistics();
      setBudgetStats(stats);
    } catch (error) {
      console.error('Error loading budget statistics:', error);
    }
  };

  // Transaction handlers
  const handleAddTransaction = async (data: CreateTransactionData) => {
    try {
      // Add current user's branch to the transaction data
      const transactionData = {
        ...data,
        branch: user?.branch?._id
      };
      await createTransaction(transactionData);
      toast.success('Transaction created successfully');
      setIsAddingTransaction(false);
      // Refresh both transaction and budget data since expenses affect budgets
      await Promise.all([
        loadTransactions(),
        loadTransactionStatistics(),
        loadBudgets(),
        loadBudgetStatistics()
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async (data: UpdateTransactionData) => {
    if (!editingTransaction) return;

    try {
      await updateTransaction(editingTransaction._id, data);
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
      // Refresh both transaction and budget data since expenses affect budgets
      await Promise.all([
        loadTransactions(),
        loadTransactionStatistics(),
        loadBudgets(),
        loadBudgetStatistics()
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully');
      // Refresh both transaction and budget data since expenses affect budgets
      await Promise.all([
        loadTransactions(),
        loadTransactionStatistics(),
        loadBudgets(),
        loadBudgetStatistics()
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  // Budget handlers
  const handleAddBudget = async (data: CreateBudgetData) => {
    try {
      // Add current user's branch to the budget data
      const budgetData = {
        ...data,
        branch: user?.branch?._id
      };
      await createBudget(budgetData);
      toast.success('Budget created successfully');
      setIsAddingBudget(false);
      await Promise.all([loadBudgets(), loadBudgetStatistics()]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create budget');
    }
  };

  const handleUpdateBudget = async (data: UpdateBudgetData) => {
    if (!editingBudget) return;
    
    try {
      await updateBudget(editingBudget._id, data);
      toast.success('Budget updated successfully');
      setEditingBudget(null);
      await Promise.all([loadBudgets(), loadBudgetStatistics()]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await deleteBudget(id);
      toast.success('Budget deleted successfully');
      await Promise.all([loadBudgets(), loadBudgetStatistics()]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  const handleRefreshBudget = async (id: string) => {
    try {
      await refreshBudget(id);
      toast.success('Budget refreshed successfully');
      await loadBudgets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh budget');
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'exceeded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getBudgetStatusColor = (budgetStatus: string) => {
    switch (budgetStatus) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'exceeded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading finance data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-1">
            Manage transactions and budgets for {user?.branch?.name || 'all branches'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(transactionStats?.totalIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(transactionStats?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(transactionStats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(transactionStats?.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {transactionStats?.pendingTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(transactionStats?.pendingIncome || 0)} pending income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Financial Transactions</CardTitle>
                  <CardDescription>Manage all income and expense transactions</CardDescription>
                </div>
                {(user?.role === 'superAdmin' || user?.role === 'admin') && (
                  <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#2E8B57] hover:bg-[#236446] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                        <DialogDescription>
                          Enter transaction details below.
                        </DialogDescription>
                      </DialogHeader>
                      <TransactionForm
                        students={students}
                        onSubmit={handleAddTransaction}
                        onCancel={() => setIsAddingTransaction(false)}
                        incomeCategories={incomeCategories}
                        expenseCategories={expenseCategories}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Transaction Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search transactions..."
                    value={transactionFilters.search}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <Select
                  value={transactionFilters.type || 'all'}
                  onValueChange={(value) => setTransactionFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={transactionFilters.category || 'all'}
                  onValueChange={(value) => setTransactionFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getAvailableCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={transactionFilters.status || 'all'}
                  onValueChange={(value) => setTransactionFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                ) : (
                  transactions.map(transaction => (
                    <TransactionCard
                      key={transaction._id}
                      transaction={transaction}
                      onEdit={setEditingTransaction}
                      onDelete={handleDeleteTransaction}
                      formatCurrency={formatCurrency}
                      getStatusColor={getStatusColor}
                      getTypeColor={getTypeColor}
                      canEdit={user?.role === 'superAdmin' || user?.role === 'admin'}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetManagement
            budgets={budgets}
            budgetStats={budgetStats}
            loading={budgetsLoading}
            user={user}
            onAdd={handleAddBudget}
            onUpdate={handleUpdateBudget}
            onDelete={handleDeleteBudget}
            onRefresh={handleRefreshBudget}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getBudgetStatusColor={getBudgetStatusColor}
            budgetFilters={budgetFilters}
            setBudgetFilters={setBudgetFilters}
            loadBudgets={loadBudgets}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update transaction details below.
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              students={students}
              transaction={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => setEditingTransaction(null)}
              isEditing
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Transaction Card Component
interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
  canEdit: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  formatCurrency,
  getStatusColor,
  getTypeColor,
  canEdit
}) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
            <span className={`font-semibold ${getTypeColor(transaction.type)}`}>
              {transaction.type.toUpperCase()}
            </span>
            {transaction.reference && (
              <span className="text-sm text-gray-500">#{transaction.reference}</span>
            )}
          </div>

          <h3 className="font-semibold text-lg">{transaction.category}</h3>
          <p className="text-gray-600 mb-2">{transaction.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>Date: {new Date(transaction.date).toLocaleDateString()}</span>
            {transaction.student && (
              <span>Student: {transaction.student.fullName}</span>
            )}
            {transaction.course && (
              <span>Course: {transaction.course.title}</span>
            )}
            <span>Branch: {transaction.branch.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`text-xl font-bold ${getTypeColor(transaction.type)}`}>
              {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(transaction)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(transaction._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Transaction Form Component
interface TransactionFormProps {
  students: Student[];
  transaction?: Transaction;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  incomeCategories: string[];
  expenseCategories: string[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  students,
  transaction,
  onSubmit,
  onCancel,
  isEditing = false,
  incomeCategories,
  expenseCategories
}) => {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'income',
    category: transaction?.category || '',
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: transaction?.status || 'pending',
    reference: transaction?.reference || '',
    student: transaction?.student?._id || '',
    course: transaction?.course?._id || ''
  });

  // Categories are now passed as props

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      status: formData.status as 'pending' | 'completed' | 'cancelled',
      reference: formData.reference || undefined,
      student: formData.student || undefined,
      course: formData.course || undefined
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (LKR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pending' | 'completed' | 'cancelled' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reference">Reference (Optional)</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            placeholder="Auto-generated if empty"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="student">Student (Optional)</Label>
        <Select
          value={formData.student || 'none'}
          onValueChange={(value) => setFormData(prev => ({ ...prev, student: value === 'none' ? '' : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No student</SelectItem>
            {students.map(student => (
              <SelectItem key={student._id} value={student._id}>
                {student.fullName} ({student.studentId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#2E8B57] hover:bg-[#236446]">
          {isEditing ? 'Update' : 'Create'} Transaction
        </Button>
      </div>
    </form>
  );
};

// Budget Management Component
interface BudgetManagementProps {
  budgets: Budget[];
  budgetStats: BudgetStatistics | null;
  loading: boolean;
  user: User | null;
  onAdd: (data: CreateBudgetData) => void;
  onUpdate: (data: UpdateBudgetData) => void;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getBudgetStatusColor: (status: string) => string;
  budgetFilters: any;
  setBudgetFilters: any;
  loadBudgets: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({
  budgets,
  budgetStats,
  loading,
  user,
  onAdd,
  onUpdate,
  onDelete,
  onRefresh,
  formatCurrency,
  getStatusColor,
  getBudgetStatusColor,
  budgetFilters,
  setBudgetFilters,
  loadBudgets,
  incomeCategories,
  expenseCategories
}) => {
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleAddBudget = async (data: CreateBudgetData) => {
    try {
      await onAdd(data);
      setIsAddingBudget(false);
    } catch (error) {
      // Error is already handled in the parent component
      // Keep dialog open so user can try again
    }
  };

  const handleUpdateBudget = async (data: UpdateBudgetData) => {
    try {
      await onUpdate(data);
      setEditingBudget(null);
    } catch (error) {
      // Error is already handled in the parent component
      // Keep dialog open so user can try again
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(budgetStats?.totalAllocated || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(budgetStats?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetStats?.overallUtilization || 0}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(budgetStats?.totalRemaining || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exceeded Budgets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {budgetStats?.exceededBudgets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {budgetStats?.totalBudgets || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>Manage budget allocations and track spending</CardDescription>
            </div>
            {user?.role === 'superAdmin' && (
              <Dialog open={isAddingBudget} onOpenChange={setIsAddingBudget}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2E8B57] hover:bg-[#236446] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Budget</DialogTitle>
                    <DialogDescription>
                      Create a new budget allocation.
                    </DialogDescription>
                  </DialogHeader>
                  <BudgetForm
                    onSubmit={handleAddBudget}
                    onCancel={() => setIsAddingBudget(false)}
                    categories={expenseCategories}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Budget Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search budgets..."
                value={budgetFilters.search}
                onChange={(e) => setBudgetFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <Select
              value={budgetFilters.category || 'all'}
              onValueChange={(value) => setBudgetFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...incomeCategories, ...expenseCategories].map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={budgetFilters.period || 'all'}
              onValueChange={(value) => setBudgetFilters(prev => ({ ...prev, period: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={budgetFilters.status || 'all'}
              onValueChange={(value) => setBudgetFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="exceeded">Exceeded</SelectItem>
              </SelectContent>
            </Select>

          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading budgets...</span>
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No budgets found
              </div>
            ) : (
              budgets.map(budget => (
                <BudgetCard
                  key={budget._id}
                  budget={budget}
                  onEdit={setEditingBudget}
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                  formatCurrency={formatCurrency}
                  getStatusColor={getStatusColor}
                  getBudgetStatusColor={getBudgetStatusColor}
                  canEdit={user?.role === 'superAdmin'}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Budget Dialog */}
      {editingBudget && (
        <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>
                Update budget details below.
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              budget={editingBudget}
              onSubmit={handleUpdateBudget}
              onCancel={() => setEditingBudget(null)}
              isEditing
              categories={expenseCategories}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Budget Card Component
interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getBudgetStatusColor: (status: string) => string;
  canEdit: boolean;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  onRefresh,
  formatCurrency,
  getStatusColor,
  getBudgetStatusColor,
  canEdit
}) => {
  const utilizationPercentage = budget.utilizationPercentage || 0;
  const remaining = budget.remaining || 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getStatusColor(budget.status)}>
              {budget.status}
            </Badge>
            <Badge className={getBudgetStatusColor(budget.budgetStatus || 'good')}>
              {budget.budgetStatus || 'good'}
            </Badge>
            <span className="text-sm text-gray-500 capitalize">{budget.period}</span>
          </div>

          <h3 className="font-semibold text-lg">{budget.category}</h3>
          {budget.description && (
            <p className="text-gray-600 mb-2">{budget.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>Period: {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}</span>
            <span>Branch: {budget.branch.name}</span>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(budget._id)}
              title="Refresh spent amount"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Budget Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Allocated: {formatCurrency(budget.allocated)}</span>
          <span>Spent: {formatCurrency(budget.spent)}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              utilizationPercentage >= 100 ? 'bg-red-500' :
              utilizationPercentage >= 80 ? 'bg-orange-500' :
              utilizationPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className={utilizationPercentage >= 100 ? 'text-red-600' : 'text-green-600'}>
            Remaining: {formatCurrency(remaining)}
          </span>
          <span className="font-medium">
            {utilizationPercentage.toFixed(1)}% used
          </span>
        </div>
      </div>
    </div>
  );
};

// Budget Form Component
interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  categories: string[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onSubmit,
  onCancel,
  isEditing = false,
  categories
}) => {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    allocated: budget?.allocated?.toString() || '',
    period: budget?.period || 'monthly',
    startDate: budget?.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: budget?.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
    description: budget?.description || '',
    status: budget?.status || 'active'
  });

  // Categories are now passed as props

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      category: formData.category,
      allocated: parseFloat(formData.allocated),
      period: formData.period as 'monthly' | 'quarterly' | 'yearly',
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description || undefined,
      status: formData.status as 'active' | 'inactive' | 'completed' | 'exceeded'
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="allocated">Allocated Amount (LKR)</Label>
          <Input
            id="allocated"
            type="number"
            step="0.01"
            min="0"
            value={formData.allocated}
            onChange={(e) => setFormData(prev => ({ ...prev, allocated: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="period">Period</Label>
          <Select
            value={formData.period}
            onValueChange={(value) => setFormData(prev => ({ ...prev, period: value as 'monthly' | 'quarterly' | 'yearly' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' | 'completed' | 'exceeded' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Budget description..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#2E8B57] hover:bg-[#236446]">
          {isEditing ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
};

export default FinanceManagement;
