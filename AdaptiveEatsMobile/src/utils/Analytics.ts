import { Platform } from 'react-native';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  platform: string;
  version: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  endpoint?: string;
  apiKey?: string;
}

class Analytics {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private sessionId: string;

  constructor(config: AnalyticsConfig = { enabled: true, sampleRate: 1.0 }) {
    this.config = config;
    this.isEnabled = config.enabled && Math.random() < config.sampleRate;
    this.sessionId = this.generateSessionId();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track app events
  track(eventName: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        session_id: this.sessionId,
        platform: Platform.OS,
        version: Platform.Version.toString(),
      },
      timestamp: Date.now(),
      platform: Platform.OS,
      version: Platform.Version.toString(),
    };

    this.events.push(event);

    // Log in development
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }

    // Send to analytics service
    this.sendToAnalytics(event);
  }

  // Track screen views
  trackScreenView(screenName: string, properties: Record<string, any> = {}) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user interactions
  trackUserInteraction(action: string, category: string = 'User Interaction', properties: Record<string, any> = {}) {
    this.track('user_interaction', {
      action,
      category,
      ...properties,
    });
  }

  // Track recipe adaptation events
  trackRecipeAdaptation(data: {
    method: 'text' | 'image';
    dietaryRestrictions: string[];
    allergies: string[];
    hasImage: boolean;
    success: boolean;
    error?: string;
    duration?: number;
  }) {
    this.track('recipe_adaptation', {
      method: data.method,
      dietary_restrictions: data.dietaryRestrictions,
      allergies: data.allergies,
      has_image: data.hasImage,
      success: data.success,
      error: data.error,
      duration: data.duration,
      dietary_restrictions_count: data.dietaryRestrictions.length,
      allergies_count: data.allergies.length,
    });
  }

  // Track API calls
  trackAPICall(endpoint: string, success: boolean, duration: number, error?: string) {
    this.track('api_call', {
      endpoint,
      success,
      duration,
      error,
    });
  }

  // Track image operations
  trackImageOperation(operation: 'pick' | 'capture' | 'load', success: boolean, duration?: number, error?: string) {
    this.track('image_operation', {
      operation,
      success,
      duration,
      error,
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      error_name: error.name,
    });
  }

  // Track performance metrics
  trackPerformance(metricName: string, value: number, properties: Record<string, any> = {}) {
    this.track('performance_metric', {
      metric_name: metricName,
      value,
      ...properties,
    });
  }

  // Track user preferences
  trackUserPreferences(preferences: Record<string, any>) {
    this.track('user_preferences', preferences);
  }

  // Track app lifecycle events
  trackAppLifecycle(event: 'foreground' | 'background' | 'active' | 'inactive') {
    this.track('app_lifecycle', {
      event,
    });
  }

  // Send events to analytics service
  private async sendToAnalytics(event: AnalyticsEvent) {
    try {
      // In production, you would send to your analytics service
      // For now, we'll just log it
      if (__DEV__) {
        console.log('Sending to analytics:', event);
      }

      // Example: Send to a custom analytics endpoint
      if (this.config.endpoint && this.config.apiKey) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.log('Failed to send analytics event:', error);
    }
  }

  // Batch send events
  async flush() {
    if (this.events.length === 0) return;

    try {
      // Send all pending events
      for (const event of this.events) {
        await this.sendToAnalytics(event);
      }
      
      // Clear sent events
      this.events = [];
    } catch (error) {
      console.log('Failed to flush analytics events:', error);
    }
  }

  // Get all events
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear all events
  clearEvents() {
    this.events = [];
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled && this.config.enabled;
  }

  // Update configuration
  updateConfig(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };
    this.isEnabled = this.config.enabled && Math.random() < this.config.sampleRate;
  }
}

// Export singleton instance
export const analytics = new Analytics({
  enabled: true,
  sampleRate: 1.0, // 100% sampling in development, adjust for production
});

// Export class for custom instances
export { Analytics };
