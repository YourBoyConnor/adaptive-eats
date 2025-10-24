'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

interface AnalyticsMetrics {
  pageViews: number;
  recipeAdaptations: number;
  successRate: number;
  averageLoadTime: number;
  errorRate: number;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const [analytics, setAnalytics] = useState<AnalyticsMetrics>({
    pageViews: 0,
    recipeAdaptations: 0,
    successRate: 0,
    averageLoadTime: 0,
    errorRate: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or for admin users
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = typeof window !== 'undefined' && 
      window.location.search.includes('admin=true');
    
    if (isDev || isAdmin) {
      setIsVisible(true);
      loadMetrics();
    }
  }, []);

  const loadMetrics = async () => {
    // Load Web Vitals
    if (typeof window !== 'undefined') {
      // Get metrics from performance observer
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
          } else if (entry.entryType === 'first-input') {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          } else if (entry.entryType === 'layout-shift') {
            setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as PerformanceEntry & { value: number }).value }));
          }
        });
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Get TTFB
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({ 
          ...prev, 
          ttfb: navigation.responseStart - navigation.requestStart 
        }));
      }

      // Simulate analytics data (in production, this would come from your analytics service)
      setAnalytics({
        pageViews: Math.floor(Math.random() * 1000) + 500,
        recipeAdaptations: Math.floor(Math.random() * 200) + 100,
        successRate: 85 + Math.random() * 10,
        averageLoadTime: 1200 + Math.random() * 500,
        errorRate: Math.random() * 5,
      });
    }
  };

  const getScoreColor = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.needsImprovement) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return 'Good';
    if (value <= thresholds.needsImprovement) return 'Needs Improvement';
    return 'Poor';
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-md rounded-lg p-4 text-white text-xs max-w-sm z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Performance Dashboard</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Web Vitals */}
        <div>
          <h4 className="font-medium mb-2 text-gray-300">Core Web Vitals</h4>
          <div className="space-y-1">
            {metrics.fcp && (
              <div className="flex justify-between">
                <span>FCP:</span>
                <span className={getScoreColor(metrics.fcp, { good: 1800, needsImprovement: 3000 })}>
                  {Math.round(metrics.fcp)}ms ({getScoreLabel(metrics.fcp, { good: 1800, needsImprovement: 3000 })})
                </span>
              </div>
            )}
            {metrics.lcp && (
              <div className="flex justify-between">
                <span>LCP:</span>
                <span className={getScoreColor(metrics.lcp, { good: 2500, needsImprovement: 4000 })}>
                  {Math.round(metrics.lcp)}ms ({getScoreLabel(metrics.lcp, { good: 2500, needsImprovement: 4000 })})
                </span>
              </div>
            )}
            {metrics.fid && (
              <div className="flex justify-between">
                <span>FID:</span>
                <span className={getScoreColor(metrics.fid, { good: 100, needsImprovement: 300 })}>
                  {Math.round(metrics.fid)}ms ({getScoreLabel(metrics.fid, { good: 100, needsImprovement: 300 })})
                </span>
              </div>
            )}
            {metrics.cls && (
              <div className="flex justify-between">
                <span>CLS:</span>
                <span className={getScoreColor(metrics.cls, { good: 0.1, needsImprovement: 0.25 })}>
                  {metrics.cls.toFixed(3)} ({getScoreLabel(metrics.cls, { good: 0.1, needsImprovement: 0.25 })})
                </span>
              </div>
            )}
            {metrics.ttfb && (
              <div className="flex justify-between">
                <span>TTFB:</span>
                <span className={getScoreColor(metrics.ttfb, { good: 800, needsImprovement: 1800 })}>
                  {Math.round(metrics.ttfb)}ms ({getScoreLabel(metrics.ttfb, { good: 800, needsImprovement: 1800 })})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Analytics */}
        <div>
          <h4 className="font-medium mb-2 text-gray-300">Analytics</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Page Views:</span>
              <span className="text-blue-400">{analytics.pageViews}</span>
            </div>
            <div className="flex justify-between">
              <span>Recipe Adaptations:</span>
              <span className="text-green-400">{analytics.recipeAdaptations}</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="text-green-400">{analytics.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Load Time:</span>
              <span className="text-yellow-400">{Math.round(analytics.averageLoadTime)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className="text-red-400">{analytics.errorRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-600">
          <button
            onClick={loadMetrics}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
          >
            Refresh Metrics
          </button>
        </div>
      </div>
    </motion.div>
  );
}
