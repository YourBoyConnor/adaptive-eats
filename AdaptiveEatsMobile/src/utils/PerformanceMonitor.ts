import { Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  platform: string;
  version: string;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  endpoint?: string;
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;

  constructor(config: PerformanceConfig = { enabled: true, sampleRate: 1.0 }) {
    this.config = config;
    this.isEnabled = config.enabled && Math.random() < config.sampleRate;
  }

  // Track app startup time
  trackAppStart() {
    if (!this.isEnabled) return;

    const startTime = Date.now();
    
    // Track when app becomes ready
    const trackReady = () => {
      const loadTime = Date.now() - startTime;
      this.recordMetric('app_start_time', loadTime);
    };

    // Track when first screen renders
    const trackFirstRender = () => {
      const renderTime = Date.now() - startTime;
      this.recordMetric('first_render_time', renderTime);
    };

    return { trackReady, trackFirstRender };
  }

  // Track screen navigation performance
  trackScreenTransition(screenName: string) {
    if (!this.isEnabled) return;

    const startTime = Date.now();
    
    return () => {
      const transitionTime = Date.now() - startTime;
      this.recordMetric(`screen_transition_${screenName}`, transitionTime);
    };
  }

  // Track API call performance
  trackAPICall(endpoint: string) {
    if (!this.isEnabled) return;

    const startTime = Date.now();
    
    return (success: boolean, error?: string) => {
      const duration = Date.now() - startTime;
      this.recordMetric(`api_call_${endpoint}`, duration, {
        success,
        error: error || null,
      });
    };
  }

  // Track image loading performance
  trackImageLoad(imageUri: string) {
    if (!this.isEnabled) return;

    const startTime = Date.now();
    
    return (success: boolean, error?: string) => {
      const duration = Date.now() - startTime;
      this.recordMetric('image_load_time', duration, {
        success,
        error: error || null,
        imageUri: imageUri.substring(0, 50), // Truncate for privacy
      });
    };
  }

  // Track memory usage
  trackMemoryUsage() {
    if (!this.isEnabled || Platform.OS !== 'android') return;

    try {
      // This is a simplified version - in production you'd use native modules
      const memoryInfo = (global as any).performance?.memory;
      if (memoryInfo) {
        this.recordMetric('memory_used', memoryInfo.usedJSHeapSize);
        this.recordMetric('memory_total', memoryInfo.totalJSHeapSize);
      }
    } catch (error) {
      console.log('Memory tracking not available:', error);
    }
  }

  // Track user interactions
  trackUserInteraction(action: string, category: string = 'User Interaction') {
    if (!this.isEnabled) return;

    this.recordMetric('user_interaction', 1, {
      action,
      category,
    });
  }

  // Record a performance metric
  private recordMetric(name: string, value: number, metadata?: any) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      platform: Platform.OS,
      version: Platform.Version.toString(),
      ...metadata,
    };

    this.metrics.push(metric);

    // Log in development
    if (__DEV__) {
      console.log('Performance Metric:', metric);
    }

    // Send to analytics if configured
    if (this.config.endpoint) {
      this.sendToAnalytics(metric);
    }
  }

  // Send metrics to analytics service
  private async sendToAnalytics(metric: PerformanceMetric) {
    try {
      // In production, you would send to your analytics service
      // For now, we'll just log it
      console.log('Sending to analytics:', metric);
    } catch (error) {
      console.log('Failed to send metric to analytics:', error);
    }
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled && this.config.enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor({
  enabled: true,
  sampleRate: 1.0, // 100% sampling in development, adjust for production
});

// Export class for custom instances
export { PerformanceMonitor };
