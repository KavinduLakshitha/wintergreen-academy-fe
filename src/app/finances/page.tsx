'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  BanknoteIcon as Banknote
} from 'lucide-react';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  studentId?: number;
  reference?: string;
}

interface Budget {
  id: number;
  category: string;
  allocated: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly';
}

interface Student {
  id: number;
  name: string;
  studentId: string;
}

const FinanceManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'income',
      category: 'Tuition Fees',
      amount: 75000,
      description: 'Monthly tuition payment - Kasun Perera',
      date: '2025-06-01',
      status: 'completed',
      studentId: 1,
      reference: 'TF-2025-001'
    },
    {
      id: 2,
      type: 'income',
      category: 'Registration Fees',
      amount: 15000,
      description: 'New student registration - Nimali Fernando',
      date: '2025-06-02',
      status: 'completed',
      studentId: 2,
      reference: 'RF-2025-002'
    },
    {
      id: 3,
      type: 'expense',
      category: 'Salaries',
      amount: 250000,
      description: 'Staff salaries for May 2025',
      date: '2025-06-01',
      status: 'completed',
      reference: 'SAL-2025-05'
    },
    {
      id: 4,
      type: 'expense',
      category: 'Utilities',
      amount: 35000,
      description: 'Electricity and water bills',
      date: '2025-06-03',
      status: 'completed',
      reference: 'UTL-2025-06'
    },
    {
      id: 5,
      type: 'income',
      category: 'Course Fees',
      amount: 45000,
      description: 'Advanced Programming Course - Tharushi Jayasinghe',
      date: '2025-06-05',
      status: 'pending',
      studentId: 3,
      reference: 'CF-2025-003'
    },
    {
      id: 6,
      type: 'expense',
      category: 'Equipment',
      amount: 120000,
      description: 'New computers for lab',
      date: '2025-06-04',
      status: 'pending',
      reference: 'EQ-2025-001'
    }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { id: 1, category: 'Salaries', allocated: 3000000, spent: 2500000, period: 'monthly' },
    { id: 2, category: 'Utilities', allocated: 150000, spent: 105000, period: 'monthly' },
    { id: 3, category: 'Equipment', allocated: 500000, spent: 320000, period: 'monthly' },
    { id: 4, category: 'Marketing', allocated: 100000, spent: 45000, period: 'monthly' },
    { id: 5, category: 'Maintenance', allocated: 75000, spent: 28000, period: 'monthly' }
  ]);

  const [students] = useState<Student[]>([
    { id: 1, name: 'Kasun Perera', studentId: 'STU001' },
    { id: 2, name: 'Nimali Fernando', studentId: 'STU002' },
    { id: 3, name: 'Tharushi Jayasinghe', studentId: 'STU003' },
    { id: 4, name: 'Ruwan Silva', studentId: 'STU004' },
    { id: 5, name: 'Dilani Wickramasinghe', studentId: 'STU005' }
  ]);

  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  // Calculate financial metrics
  const getFinancialMetrics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.status === 'completed';
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const pendingIncome = pendingTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      pendingIncome,
      pendingTransactions: pendingTransactions.length
    };
  };

  const metrics = getFinancialMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Math.max(...transactions.map(t => t.id)) + 1
    };
    setTransactions([...transactions, newTransaction]);
    setIsAddingTransaction(false);
  };

  const handleEditTransaction = (updatedTransaction: Transaction | Omit<Transaction, 'id'>) => {
    // If 'id' is missing, do nothing (should not happen in edit mode)
    if (!('id' in updatedTransaction)) return;
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction as Transaction : t
    ));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Management</h1>
          <p className="text-gray-600">Manage academy finances, budgets, and financial reporting</p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalIncome)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <TrendingDown className="inline w-3 h-3 mr-1" />
                    -5% from last month
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.netProfit)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current month profit
                  </p>
                </div>
                <div className={`p-3 rounded-full ${metrics.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Wallet className={`w-6 h-6 ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Income</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.pendingIncome)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.pendingTransactions} pending transactions
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="students">Student Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Financial Transactions</CardTitle>
                    <CardDescription>Manage all income and expense transactions</CardDescription>
                  </div>
                  <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
                    <DialogTrigger asChild>
                      <Button>
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
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={(value: 'all' | 'pending' | 'completed' | 'cancelled') => setFilterStatus(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map(transaction => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      students={students}
                      onEdit={setEditingTransaction}
                      onDelete={handleDeleteTransaction}
                      formatCurrency={formatCurrency}
                      getStatusColor={getStatusColor}
                      getTypeColor={getTypeColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetManagement
              budgets={budgets}
              setBudgets={setBudgets}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentPayments
              students={students}
              transactions={transactions}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Transaction Dialog */}
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update transaction details below.
              </DialogDescription>
            </DialogHeader>
            {editingTransaction && (
              <TransactionForm
                transaction={editingTransaction}
                students={students}
                onSubmit={handleEditTransaction}
                onCancel={() => setEditingTransaction(null)}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Transaction Card Component
interface TransactionCardProps {
  transaction: Transaction;
  students: Student[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  students,
  onEdit,
  onDelete,
  formatCurrency,
  getStatusColor,
  getTypeColor
}) => {
  const student = transaction.studentId ? students.find(s => s.id === transaction.studentId) : null;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
          {transaction.type === 'income' ? 
            <TrendingUp className="w-5 h-5 text-green-600" /> : 
            <TrendingDown className="w-5 h-5 text-red-600" />
          }
        </div>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{transaction.category}</span>
            <span>•</span>
            <span>{new Date(transaction.date).toLocaleDateString()}</span>
            {transaction.reference && (
              <>
                <span>•</span>
                <span>{transaction.reference}</span>
              </>
            )}
            {student && (
              <>
                <span>•</span>
                <span>{student.name}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className={`font-bold text-lg ${getTypeColor(transaction.type)}`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(transaction)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(transaction.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Transaction Form Component
interface TransactionFormProps {
  transaction?: Transaction;
  students: Student[];
  onSubmit: (transaction: Transaction | Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  students,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'income' as 'income' | 'expense',
    category: transaction?.category || '',
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    status: transaction?.status || 'pending' as 'pending' | 'completed' | 'cancelled',
    studentId: transaction?.studentId?.toString() || '',
    reference: transaction?.reference || ''
  });

  const incomeCategories = ['Tuition Fees', 'Registration Fees', 'Course Fees', 'Late Fees', 'Other Income'];
  const expenseCategories = ['Salaries', 'Utilities', 'Equipment', 'Marketing', 'Maintenance', 'Rent', 'Supplies', 'Other Expenses'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      studentId: formData.studentId ? parseInt(formData.studentId) : undefined
    };

    if (isEditing && transaction) {
      onSubmit({ ...submissionData, id: transaction.id });
    } else {
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Transaction Type</Label>
          <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => {
            setFormData({...formData, type: value, category: ''});
          }}>
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
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Amount (LKR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'pending' | 'completed' | 'cancelled') => setFormData({...formData, status: value})}>
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
          <Label htmlFor="reference">Reference Number</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({...formData, reference: e.target.value})}
            placeholder="e.g., TF-2025-001"
          />
        </div>
      </div>

      {formData.type === 'income' && (
        <div>
          <Label htmlFor="studentId">Student (Optional)</Label>
          <Select value={formData.studentId} onValueChange={(value) => setFormData({...formData, studentId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No student selected</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} ({student.studentId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};

// Budget Management Component
interface BudgetManagementProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  formatCurrency: (amount: number) => string;
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({ budgets, setBudgets, formatCurrency }) => {
  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.allocated) * 100;
    if (percentage >= 90) return { status: 'danger', color: 'bg-red-500' };
    if (percentage >= 75) return { status: 'warning', color: 'bg-yellow-500' };
    return { status: 'safe', color: 'bg-green-500' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Monitor budget allocation and spending across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgets.map(budget => {
            const percentage = (budget.spent / budget.allocated) * 100;
            const { status, color } = getBudgetStatus(budget);
            const remaining = budget.allocated - budget.spent;

            return (
              <div key={budget.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{budget.category}</h3>
                    <p className="text-sm text-gray-500 capitalize">{budget.period} budget</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                    </p>
                    <p className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {remaining >= 0 ? 'Remaining: ' : 'Over budget: '}{formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">{percentage.toFixed(1)}% used</span>
                  {status === 'danger' && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Over Budget
                    </Badge>
                  )}
                  {status === 'warning' && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Near Limit
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Financial Reports Component
interface FinancialReportsProps {
  transactions: Transaction[];
  budgets: Budget[];
  formatCurrency: (amount: number) => string;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ transactions, budgets, formatCurrency }) => {
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear() &&
               t.status === 'completed';
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({ month: monthName, income, expenses, profit: income - expenses });
    }
    return months;
  };

  const getCategoryBreakdown = () => {
    const categories: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.filter(t => t.status === 'completed').forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = { income: 0, expense: 0 };
      }
      categories[transaction.category][transaction.type] += transaction.amount;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      ...data,
      net: data.income - data.expense
    }));
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryBreakdown();

  return (
    <div className="space-y-6">
      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Performance</CardTitle>
          <CardDescription>Income, expenses, and profit trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">{month.month}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Income</p>
                  <p className="font-medium text-green-600">{formatCurrency(month.income)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expenses</p>
                  <p className="font-medium text-red-600">{formatCurrency(month.expenses)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.profit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Analysis</CardTitle>
          <CardDescription>Financial breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{category.category}</p>
                </div>
                <div className="flex space-x-6 text-sm">
                  {category.income > 0 && (
                    <div>
                      <span className="text-gray-500">Income: </span>
                      <span className="font-medium text-green-600">{formatCurrency(category.income)}</span>
                    </div>
                  )}
                  {category.expense > 0 && (
                    <div>
                      <span className="text-gray-500">Expense: </span>
                      <span className="font-medium text-red-600">{formatCurrency(category.expense)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Net: </span>
                    <span className={`font-medium ${category.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(category.net)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
          <CardDescription>Compare budgeted amounts with actual spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map(budget => {
              const variance = budget.allocated - budget.spent;
              const variancePercentage = ((variance / budget.allocated) * 100);
              
              return (
                <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{budget.category}</p>
                    <p className="text-sm text-gray-500 capitalize">{budget.period} budget</p>
                  </div>
                  <div className="flex space-x-6 text-sm">
                    <div>
                      <span className="text-gray-500">Budgeted: </span>
                      <span className="font-medium">{formatCurrency(budget.allocated)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Spent: </span>
                      <span className="font-medium">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Variance: </span>
                      <span className={`font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(variance)} ({variancePercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Student Payments Component
interface StudentPaymentsProps {
  students: Student[];
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

const StudentPayments: React.FC<StudentPaymentsProps> = ({ students, transactions, formatCurrency }) => {
  const getStudentPaymentSummary = () => {
    return students.map(student => {
      const studentTransactions = transactions.filter(t => 
        t.studentId === student.id && t.type === 'income'
      );
      
      const totalPaid = studentTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const pendingAmount = studentTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastPayment = studentTransactions
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      return {
        student,
        totalPaid,
        pendingAmount,
        lastPayment: lastPayment ? new Date(lastPayment.date).toLocaleDateString() : 'No payments',
        transactionCount: studentTransactions.length
      };
    });
  };

  const paymentSummary = getStudentPaymentSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Payment Summary</CardTitle>
        <CardDescription>Overview of payments by student</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentSummary.map(summary => (
            <div key={summary.student.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{summary.student.name}</p>
                <p className="text-sm text-gray-500">{summary.student.studentId}</p>
              </div>
              <div className="flex space-x-6 text-sm">
                <div>
                  <p className="text-gray-500">Total Paid</p>
                  <p className="font-medium text-green-600">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending</p>
                  <p className="font-medium text-yellow-600">{formatCurrency(summary.pendingAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Payment</p>
                  <p className="font-medium">{summary.lastPayment}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transactions</p>
                  <p className="font-medium">{summary.transactionCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceManagement;