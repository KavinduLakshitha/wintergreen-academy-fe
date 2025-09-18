'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Loading skeleton for statistics cards
export const StatCardSkeleton: React.FC = () => (
  <Card>
    <CardContent className="p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for charts
export const ChartSkeleton: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for activity feed
export const ActivitySkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest updates and notifications</CardDescription>
    </CardHeader>
    <CardContent>
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
    </CardContent>
  </Card>
);

// Error boundary component
interface ErrorFallbackProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description = "An error occurred while loading the data"
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <span>{title}</span>
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <div className="mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Network error component
interface NetworkErrorProps {
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => (
  <Card>
    <CardContent className="p-8">
      <div className="text-center">
        <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Problem</h3>
        <p className="text-gray-600 mb-4">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4">
            <Wifi className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Empty state component
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon,
  action 
}) => (
  <Card>
    <CardContent className="p-8">
      <div className="text-center">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Loading spinner component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
  );
};

// Full page loading component
export const FullPageLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Loading dashboard...</p>
    </div>
  </div>
);

// Dashboard loading grid
export const DashboardLoadingGrid: React.FC = () => (
  <div className="w-full mx-auto p-6 space-y-6">
    {/* Header skeleton */}
    <div className="mb-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ChartSkeleton title="Financial Performance" description="Loading chart data..." />
      <ChartSkeleton title="Enrollment Trends" description="Loading chart data..." />
    </div>

    {/* Bottom section skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ActivitySkeleton />
      <ChartSkeleton title="User Distribution" description="Loading chart data..." />
      <ChartSkeleton title="Performance Metrics" description="Loading chart data..." />
    </div>
  </div>
);

// Error boundary wrapper
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <ErrorFallback
            error={this.state.error?.message || 'An unexpected error occurred'}
            title="Dashboard Error"
            description="The dashboard encountered an error and needs to be refreshed"
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
