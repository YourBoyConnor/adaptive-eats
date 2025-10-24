'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Type definitions for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
    trackRecipeAdaptation?: (data: { method: string; dietaryRestrictions: string[]; allergies: string[]; hasImage: boolean; success: boolean; error?: string }) => void;
  }
}

export function AnalyticsProvider() {
  useEffect(() => {
    // Track Web Vitals
    const trackWebVitals = (metric: { name: string; value: number; id: string }) => {
      // Send to analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
      }
    };

    // Measure Core Web Vitals
    onCLS(trackWebVitals);
    onINP(trackWebVitals);
    onFCP(trackWebVitals);
    onLCP(trackWebVitals);
    onTTFB(trackWebVitals);

    // Track page views
    const trackPageView = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID', {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    // Track initial page view
    trackPageView();

    // Track route changes (for SPA behavior)
    const handleRouteChange = () => {
      trackPageView();
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    // Track user interactions
    const trackUserInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const element = target.closest('[data-track]');
      
      if (element) {
        const action = element.getAttribute('data-track');
        const category = element.getAttribute('data-category') || 'User Interaction';
        
        if (action && typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', action, {
            event_category: category,
            event_label: element.textContent?.substring(0, 50) || 'Unknown',
          });
        }
      }
    };

    // Add event listeners for tracking
    document.addEventListener('click', trackUserInteraction);
    document.addEventListener('submit', trackUserInteraction);

    // Track recipe adaptation events
    const trackRecipeAdaptation = (data: { method: string; dietaryRestrictions: string[]; allergies: string[]; hasImage: boolean; success: boolean; error?: string }) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'recipe_adaptation', {
          event_category: 'Recipe',
          event_label: data.method, // 'text' or 'image'
          value: data.dietaryRestrictions?.length || 0,
          custom_parameters: {
            dietary_restrictions: data.dietaryRestrictions?.join(',') || '',
            allergies: data.allergies?.join(',') || '',
            has_image: data.hasImage ? 'yes' : 'no',
          },
        });
      }
    };

    // Expose tracking function globally for use in components
    if (typeof window !== 'undefined') {
      window.trackRecipeAdaptation = trackRecipeAdaptation;
    }

    // Error monitoring is handled by the ErrorMonitoring class

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('click', trackUserInteraction);
      document.removeEventListener('submit', trackUserInteraction);
    };
  }, []);

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Utility function to track custom events
export const trackEvent = (action: string, category: string = 'User Interaction', label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Utility function to track recipe adaptations
export const trackRecipeAdaptation = (data: {
  method: 'text' | 'image';
  dietaryRestrictions: string[];
  allergies: string[];
  hasImage: boolean;
  success: boolean;
  error?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', data.success ? 'recipe_adaptation_success' : 'recipe_adaptation_error', {
      event_category: 'Recipe',
      event_label: data.method,
      value: data.dietaryRestrictions.length,
      custom_parameters: {
        dietary_restrictions: data.dietaryRestrictions.join(','),
        allergies: data.allergies.join(','),
        has_image: data.hasImage ? 'yes' : 'no',
        error_message: data.error || '',
      },
    });
  }
};
