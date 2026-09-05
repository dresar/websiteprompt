import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash-es';
import React from 'react';

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

export interface UsePerformanceOptimizationOptions {
  debounceMs?: number;
  throttleMs?: number;
  enableMetrics?: boolean;
  maxCacheSize?: number;
}

export function usePerformanceOptimization(options: UsePerformanceOptimizationOptions = {}) {
  const {
    debounceMs = 300,
    throttleMs = 100,
    enableMetrics = true,
    maxCacheSize = 100
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const memoCache = useRef<Map<string, any>>(new Map());

  // Performance tracking
  useEffect(() => {
    if (!enableMetrics) return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      renderTimes.current.push(renderTime);
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }

      const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;

      setMetrics(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime
      }));
    };
  });

  // Debounced callback creator
  const createDebouncedCallback = useCallback(
    <T extends (...args: any[]) => any>(callback: T, customMs?: number): T => {
      return debounce(callback, customMs || debounceMs) as T;
    },
    [debounceMs]
  );

  // Throttled callback creator
  const createThrottledCallback = useCallback(
    <T extends (...args: any[]) => any>(callback: T, customMs?: number): T => {
      return throttle(callback, customMs || throttleMs) as T;
    },
    [throttleMs]
  );

  // Memoized computation with cache
  const memoizedCompute = useCallback(
    <T>(key: string, computeFn: () => T, dependencies: any[] = []): T => {
      const cacheKey = `${key}_${JSON.stringify(dependencies)}`;
      
      if (memoCache.current.has(cacheKey)) {
        return memoCache.current.get(cacheKey);
      }

      const result = computeFn();
      
      // Manage cache size
      if (memoCache.current.size >= maxCacheSize) {
        const firstKey = memoCache.current.keys().next().value;
        memoCache.current.delete(firstKey);
      }
      
      memoCache.current.set(cacheKey, result);
      return result;
    },
    [maxCacheSize]
  );

  // Clear memoization cache
  const clearCache = useCallback(() => {
    memoCache.current.clear();
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return {
      size: memoCache.current.size,
      maxSize: maxCacheSize,
      usage: (memoCache.current.size / maxCacheSize) * 100
    };
  }, [maxCacheSize]);

  // Memory usage tracking (if available)
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  // Performance report
  const getPerformanceReport = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    const cacheStats = getCacheStats();
    
    return {
      ...metrics,
      memoryUsage,
      cacheStats,
      recommendations: generateRecommendations(metrics, cacheStats)
    };
  }, [metrics, getMemoryUsage, getCacheStats]);

  return {
    metrics,
    createDebouncedCallback,
    createThrottledCallback,
    memoizedCompute,
    clearCache,
    getCacheStats,
    getMemoryUsage,
    getPerformanceReport
  };
}

// Generate performance recommendations
function generateRecommendations(
  metrics: PerformanceMetrics,
  cacheStats: { size: number; maxSize: number; usage: number }
): string[] {
  const recommendations: string[] = [];

  if (metrics.averageRenderTime > 16) {
    recommendations.push('Render time tinggi, pertimbangkan optimasi komponen');
  }

  if (metrics.renderCount > 100) {
    recommendations.push('Render count tinggi, gunakan React.memo atau useMemo');
  }

  if (cacheStats.usage > 80) {
    recommendations.push('Cache hampir penuh, pertimbangkan untuk membersihkan cache');
  }

  if (cacheStats.size === 0) {
    recommendations.push('Cache tidak digunakan, pertimbangkan untuk menggunakan memoization');
  }

  return recommendations;
}

// Utility functions for common performance patterns

// Virtual scrolling helper
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
}

// Optimized form field updater
export function useOptimizedFormUpdate<T extends Record<string, any>>(
  initialValues: T,
  debounceMs: number = 300
) {
  const [values, setValues] = useState<T>(initialValues);
  const [debouncedValues, setDebouncedValues] = useState<T>(initialValues);

  const debouncedUpdate = useMemo(
    () => debounce((newValues: T) => {
      setDebouncedValues(newValues);
    }, debounceMs),
    [debounceMs]
  );

  const updateField = useCallback((field: keyof T, value: any) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    debouncedUpdate(newValues);
  }, [values, debouncedUpdate]);

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    const newValues = { ...values, ...updates };
    setValues(newValues);
    debouncedUpdate(newValues);
  }, [values, debouncedUpdate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setDebouncedValues(initialValues);
  }, [initialValues]);

  return {
    values,
    debouncedValues,
    updateField,
    updateMultipleFields,
    resetForm
  };
}

// Component render tracker HOC
export function withRenderTracker<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name || 'Unknown'
) {
  const renderStartTime = useRef<number>(0);

  return React.memo((props: P) => {
    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
      }
    });

    renderStartTime.current = Date.now();
    return React.createElement(Component, props);
  });
}