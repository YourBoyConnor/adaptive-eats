import { Platform } from 'react-native';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  platform: string;
  version: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

interface PerformanceError {
  type: 'memory' | 'network' | 'render' | 'navigation';
  message: string;
  duration?: number;
  timestamp: number;
  context?: Record<string, any>;
}

class ErrorMonitoring {
  private errors: ErrorInfo[] = [];
  private performanceErrors: PerformanceError[] = [];
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Set up global error handler for React Native
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.captureError({
        message: error.message || 'Unknown error',
        stack: error.stack,
        severity: isFatal ? 'critical' : 'high',
        context: {
          type: 'global_error',
          isFatal,
          name: error.name,
        },
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Monitor memory usage
    this.setupMemoryMonitoring();
  }

  private setupMemoryMonitoring() {
    // Monitor memory usage periodically
    setInterval(() => {
      try {
        // This is a simplified version - in production you'd use native modules
        const memoryInfo = (global as any).performance?.memory;
        if (memoryInfo) {
          const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
          const totalMB = memoryInfo.totalJSHeapSize / 1024 / 1024;
          
          if (usedMB / totalMB > 0.9) { // More than 90% memory used
            this.capturePerformanceError({
              type: 'memory',
              message: `High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`,
              context: {
                usedMB,
                totalMB,
                limitMB: memoryInfo.jsHeapSizeLimit / 1024 / 1024,
              },
            });
          }
        }
      } catch (error) {
        // Memory monitoring not available
      }
    }, 30000); // Check every 30 seconds
  }

  private determineSeverity(error: Error | undefined): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium';

    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('timeout')) return 'medium';
    if (message.includes('syntax') || message.includes('reference')) return 'high';
    if (message.includes('out of memory') || message.includes('stack overflow')) return 'critical';
    
    return 'medium';
  }

  captureError(error: Omit<ErrorInfo, 'timestamp' | 'platform' | 'version' | 'sessionId'>) {
    if (!this.isEnabled) return;

    const errorInfo: ErrorInfo = {
      ...error,
      timestamp: Date.now(),
      platform: Platform.OS,
      version: Platform.Version.toString(),
      sessionId: this.sessionId,
    };

    this.errors.push(errorInfo);

    // Log in development
    if (__DEV__) {
      console.error('Captured Error:', errorInfo);
    }

    // Send to monitoring service
    this.sendToMonitoringService(errorInfo);
  }

  capturePerformanceError(error: Omit<PerformanceError, 'timestamp'>) {
    if (!this.isEnabled) return;

    const perfError: PerformanceError = {
      ...error,
      timestamp: Date.now(),
    };

    this.performanceErrors.push(perfError);

    // Log in development
    if (__DEV__) {
      console.warn('Performance Issue:', perfError);
    }

    // Send to monitoring service
    this.sendPerformanceErrorToMonitoringService(perfError);
  }

  // Capture API errors
  captureAPIError(endpoint: string, error: Error, duration?: number) {
    this.captureError({
      message: `API Error: ${error.message}`,
      stack: error.stack,
      severity: 'medium',
      context: {
        type: 'api_error',
        endpoint,
        duration,
      },
    });
  }

  // Capture navigation errors
  captureNavigationError(screenName: string, error: Error) {
    this.captureError({
      message: `Navigation Error: ${error.message}`,
      stack: error.stack,
      severity: 'low',
      context: {
        type: 'navigation_error',
        screenName,
      },
    });
  }

  // Capture image loading errors
  captureImageError(imageUri: string, error: Error) {
    this.captureError({
      message: `Image Loading Error: ${error.message}`,
      stack: error.stack,
      severity: 'low',
      context: {
        type: 'image_error',
        imageUri: imageUri.substring(0, 50), // Truncate for privacy
      },
    });
  }

  private async sendToMonitoringService(error: ErrorInfo) {
    try {
      // In production, send to your error monitoring service (e.g., Sentry, Bugsnag)
      if (!__DEV__) {
        // Example: Send to a custom endpoint
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error),
        });
      }
    } catch (error) {
      console.log('Failed to send error to monitoring service:', error);
    }
  }

  private async sendPerformanceErrorToMonitoringService(error: PerformanceError) {
    try {
      // In production, send to your performance monitoring service
      if (!__DEV__) {
        await fetch('/api/performance-errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error),
        });
      }
    } catch (error) {
      console.log('Failed to send performance error to monitoring service:', error);
    }
  }

  // Get error statistics
  getErrorStats() {
    const totalErrors = this.errors.length;
    const errorsBySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByType = this.errors.reduce((acc, error) => {
      const type = error.context?.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors,
      errorsBySeverity,
      errorsByType,
      performanceErrors: this.performanceErrors.length,
    };
  }

  // Clear all errors
  clearErrors() {
    this.errors = [];
    this.performanceErrors = [];
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Get all errors
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // Get performance errors
  getPerformanceErrors(): PerformanceError[] {
    return [...this.performanceErrors];
  }
}

// Export singleton instance
export const errorMonitoring = new ErrorMonitoring();

// Export class for custom instances
export { ErrorMonitoring };
