'use client';

import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { getActiveBranches } from '@/services/branchService';

interface Branch {
  _id: string;
  name: string;
  isActive: boolean;
}

const BranchSelector: React.FC = () => {
  const { state, actions } = useDashboard();
  const { filters, userRole, userBranch, stats } = state;
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState<string | null>(null);

  // Load branches on component mount
  useEffect(() => {
    const loadBranches = async () => {
      setIsLoadingBranches(true);
      setBranchError(null);
      
      try {
        const branchData = await getActiveBranches();
        setBranches(branchData);
      } catch (error) {
        setBranchError(error instanceof Error ? error.message : 'Failed to load branches');
      } finally {
        setIsLoadingBranches(false);
      }
    };

    loadBranches();
  }, []);

  // Only show branch selector for superAdmin
  if (userRole !== 'superAdmin') {
    return null;
  }

  const handleBranchChange = async (branchId: string) => {
    const newFilters = { ...filters, branchId: branchId === 'all' ? undefined : branchId };
    actions.updateFilters(newFilters);
    
    // Refresh all dashboard data with new filters
    await actions.refreshAllData();
  };

  const getCurrentBranchName = () => {
    if (!filters.branchId || filters.branchId === 'all') {
      return 'All Branches';
    }
    
    const selectedBranch = branches.find(branch => branch._id === filters.branchId);
    return selectedBranch ? selectedBranch.name : 'Unknown Branch';
  };

  const getTotalBranches = () => {
    return branches.length;
  };

  if (branchError) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error loading branches: {branchError}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Branch Filter:</span>
            </div>
            
            <Select
              value={filters.branchId || 'all'}
              onValueChange={handleBranchChange}
              disabled={isLoadingBranches}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a branch">
                  <div className="flex items-center space-x-2">
                    {(!filters.branchId || filters.branchId === 'all') ? (
                      <Globe className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-green-600" />
                    )}
                    <span>{getCurrentBranchName()}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>All Branches</span>
                  </div>
                </SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span>{branch.name}</span>
                      {branch.isActive && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Statistics */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>Total Branches:</span>
              <Badge className="bg-blue-100 text-blue-800">
                {getTotalBranches()}
              </Badge>
            </div>
            
            {stats?.branchInfo && (
              <div className="flex items-center space-x-1">
                <span>Current:</span>
                <Badge className="bg-green-100 text-green-800">
                  {stats.branchInfo.name}
                </Badge>
              </div>
            )}
            
            {stats?.branchStats && (
              <div className="flex items-center space-x-1">
                <span>System Users:</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {stats.branchStats.totalSystemUsers}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {isLoadingBranches && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
            <span>Loading branches...</span>
          </div>
        )}

        {/* Current filter info */}
        {!isLoadingBranches && (
          <div className="mt-2 text-xs text-gray-500">
            {(!filters.branchId || filters.branchId === 'all') ? (
              <span>Showing data from all branches in the system</span>
            ) : (
              <span>Showing data filtered by: {getCurrentBranchName()}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchSelector;
