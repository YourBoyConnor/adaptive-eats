interface ErrorInfo {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

interface PerformanceError {
  type: 'timeout' | 'memory' | 'network' | 'render';
  message: string;
  duration?: number;
  timestamp: number;
  context?: Record<string, unknown>;
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
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        severity: this.determineSeverity(event.error),
        context: {
          type: 'javascript',
          filename: event.filename,
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        url: window.location.href,
        stack: event.reason?.stack,
        severity: 'high',
        context: {
          type: 'promise_rejection',
          reason: event.reason?.toString(),
        },
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLImageElement | HTMLLinkElement;
        const resourceUrl = 'src' in target ? target.src : target.href;
        this.captureError({
          message: `Resource loading error: ${resourceUrl}`,
          url: resourceUrl || 'unknown',
          severity: 'medium',
          context: {
            type: 'resource_loading',
            tagName: (event.target as Element).tagName,
          },
        });
      }
    }, true);

    // Performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.capturePerformanceError({
              type: 'render',
              message: `Long task detected: ${entry.duration}ms`,
              duration: entry.duration,
              context: {
                startTime: entry.startTime,
                name: entry.name,
              },
            });
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch {
        // Long task API not supported
      }
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        if (memory) {
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const totalMB = memory.totalJSHeapSize / 1024 / 1024;
          
          if (usedMB / totalMB > 0.9) { // More than 90% memory used
            this.capturePerformanceError({
              type: 'memory',
              message: `High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`,
              context: {
                usedMB,
                totalMB,
                limitMB: memory.jsHeapSizeLimit / 1024 / 1024,
              },
            });
          }
        }
      }, 30000); // Check every 30 seconds
    }

    // Monitor network timeouts
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        this.capturePerformanceError({
          type: 'timeout',
          message: `Fetch timeout: ${args[0]}`,
          duration: Date.now() - startTime,
          context: {
            url: args[0],
            method: args[1]?.method || 'GET',
          },
        });
      }, 10000); // 10 second timeout

      try {
        const response = await originalFetch(...args);
        clearTimeout(timeout);
        return response;
      } catch (error) {
        clearTimeout(timeout);
        this.capturePerformanceError({
          type: 'network',
          message: `Network error: ${error}`,
          duration: Date.now() - startTime,
          context: {
            url: args[0],
            method: args[1]?.method || 'GET',
          },
        });
        throw error;
      }
    };
  }

  private determineSeverity(error: Error | undefined): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium';

    const message = error.message.toLowerCase();
    
    if (message.includes('chunk') || message.includes('loading')) return 'low';
    if (message.includes('network') || message.includes('fetch')) return 'medium';
    if (message.includes('syntax') || message.includes('reference')) return 'high';
    if (message.includes('out of memory') || message.includes('stack overflow')) return 'critical';
    
    return 'medium';
  }

  captureError(error: Omit<ErrorInfo, 'timestamp' | 'userAgent' | 'sessionId'>) {
    if (!this.isEnabled) return;

    const errorInfo: ErrorInfo = {
      ...error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      url: window.location.href,
    };

    this.errors.push(errorInfo);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Captured Error:', errorInfo);
    }

    // Send to monitoring service
    this.sendToMonitoringService(errorInfo);

    // Track with analytics
    if (typeof window !== 'undefined' && (window as { gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void }).gtag) {
      (window as { gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void }).gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: errorInfo.severity === 'critical',
        error_type: errorInfo.context?.type || 'unknown',
      });
    }
  }

  capturePerformanceError(error: Omit<PerformanceError, 'timestamp'>) {
    if (!this.isEnabled) return;

    const perfError: PerformanceError = {
      ...error,
      timestamp: Date.now(),
    };

    this.performanceErrors.push(perfError);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance Issue:', perfError);
    }

    // Send to monitoring service
    this.sendPerformanceErrorToMonitoringService(perfError);
  }

  private async sendToMonitoringService(error: ErrorInfo) {
    try {
      // In production, send to your error monitoring service (e.g., Sentry, Bugsnag)
      if (process.env.NODE_ENV === 'production') {
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
      if (process.env.NODE_ENV === 'production') {
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

    const errorsByType: Record<string, number> = {};
    this.errors.forEach(error => {
      const type = (error.context?.type || 'unknown') as string;
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    });

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
