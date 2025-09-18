'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  UserPlus,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

interface ActivityIconProps {
  type: string;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ type }) => {
  const getIconAndColor = (activityType: string) => {
    switch (activityType) {
      case 'user_registration':
        return { icon: UserPlus, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
      case 'payment':
        return { icon: DollarSign, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
      case 'attendance':
        return { icon: CheckCircle2, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
      case 'course':
        return { icon: BookOpen, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' };
      case 'alert':
        return { icon: AlertTriangle, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' };
      default:
        return { icon: Users, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  const { icon: Icon, bgColor, iconColor } = getIconAndColor(type);

  return (
    <div className={`p-2 rounded-full ${bgColor}`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
  );
};

const RecentActivity: React.FC = () => {
  const { state, actions } = useDashboard();
  const { recentActivity, isLoadingActivity, activityError } = state;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'attendance':
        return 'bg-purple-100 text-purple-800';
      case 'course':
        return 'bg-indigo-100 text-indigo-800';
      case 'alert':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    actions.loadRecentActivity();
  };

  if (activityError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh activity"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Error loading recent activity</p>
            <p className="text-sm text-gray-500 mt-1">{activityError}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh activity"
            disabled={isLoadingActivity}
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingActivity ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingActivity ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {activity.message}
                      </p>
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="mt-1 space-y-1">
                          {activity.details.username && (
                            <p className="text-xs text-gray-600">
                              Username: {activity.details.username}
                            </p>
                          )}
                          {activity.details.role && (
                            <Badge className={`text-xs ${getActivityBadgeColor(activity.type)}`}>
                              {activity.details.role}
                            </Badge>
                          )}
                          {activity.details.branch && (
                            <p className="text-xs text-gray-600">
                              Branch: {activity.details.branch}
                            </p>
                          )}
                          {activity.details.amount && (
                            <p className="text-xs text-green-600 font-medium">
                              Amount: LKR {activity.details.amount.toLocaleString()}
                            </p>
                          )}
                          {activity.details.course && (
                            <p className="text-xs text-gray-600">
                              Course: {activity.details.course}
                            </p>
                          )}
                          {activity.details.present && activity.details.total && (
                            <p className="text-xs text-gray-600">
                              Present: {activity.details.present}/{activity.details.total}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {recentActivity.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Showing {recentActivity.length} recent activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
