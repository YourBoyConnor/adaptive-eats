import AsyncStorage from '@react-native-async-storage/async-storage';

interface ABTestConfig {
  name: string;
  variants: {
    [key: string]: {
      weight: number;
      config: any;
    };
  };
  enabled: boolean;
}

interface ABTestResult {
  variant: string;
  config: any;
  testName: string;
}

class ABTesting {
  private tests: Map<string, ABTestConfig> = new Map();
  private assignments: Map<string, string> = new Map();
  private storageKey = 'ab_test_assignments';

  // Register a new A/B test
  registerTest(testName: string, config: ABTestConfig) {
    this.tests.set(testName, config);
  }

  // Initialize from storage
  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const assignments = JSON.parse(stored);
        this.assignments = new Map(Object.entries(assignments));
      }
    } catch (error) {
      console.log('Failed to load A/B test assignments:', error);
    }
  }

  // Get variant for a user
  async getVariant(testName: string, userId?: string): Promise<ABTestResult | null> {
    const test = this.tests.get(testName);
    if (!test || !test.enabled) {
      return null;
    }

    // Use userId or generate a stable identifier
    const identifier = userId || await this.getStableIdentifier();
    const assignmentKey = `${testName}_${identifier}`;
    
    // Check if already assigned
    if (this.assignments.has(assignmentKey)) {
      const variant = this.assignments.get(assignmentKey)!;
      return {
        variant,
        config: test.variants[variant].config,
        testName,
      };
    }

    // Assign variant based on weight
    const variant = this.selectVariant(test.variants);
    this.assignments.set(assignmentKey, variant);
    
    // Save to storage
    await this.saveAssignments();

    return {
      variant,
      config: test.variants[variant].config,
      testName,
    };
  }

  // Select variant based on weights
  private selectVariant(variants: { [key: string]: { weight: number; config: any } }): string {
    const totalWeight = Object.values(variants).reduce((sum, v) => sum + v.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const [variantName, variant] of Object.entries(variants)) {
      currentWeight += variant.weight;
      if (random <= currentWeight) {
        return variantName;
      }
    }
    
    // Fallback to first variant
    return Object.keys(variants)[0];
  }

  // Get stable identifier for consistent assignments
  private async getStableIdentifier(): Promise<string> {
    try {
      let identifier = await AsyncStorage.getItem('ab_test_identifier');
      if (!identifier) {
        identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('ab_test_identifier', identifier);
      }
      return identifier;
    } catch (error) {
      // Fallback if storage fails
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Save assignments to storage
  private async saveAssignments() {
    try {
      const assignments = Object.fromEntries(this.assignments);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(assignments));
    } catch (error) {
      console.log('Failed to save A/B test assignments:', error);
    }
  }

  // Track conversion for a test
  trackConversion(testName: string, variant: string, conversionType: string, value?: number) {
    // In production, you would send this to your analytics service
    console.log('AB Test Conversion:', {
      testName,
      variant,
      conversionType,
      value,
      timestamp: Date.now(),
    });
  }

  // Get all active tests
  getActiveTests(): ABTestConfig[] {
    return Array.from(this.tests.values()).filter(test => test.enabled);
  }

  // Clear assignments (useful for testing)
  async clearAssignments() {
    this.assignments.clear();
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem('ab_test_identifier');
    } catch (error) {
      console.log('Failed to clear A/B test assignments:', error);
    }
  }
}

// Export singleton instance
export const abTesting = new ABTesting();

// Predefined tests for AdaptiveEats Mobile
export const initializeABTests = () => {
  // Test 1: Image capture vs gallery preference
  abTesting.registerTest('image_input_preference', {
    name: 'Image Input Preference',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          showCameraFirst: false,
          buttonStyle: 'equal',
          showPreview: true,
        },
      },
      camera_first: {
        weight: 25,
        config: {
          showCameraFirst: true,
          buttonStyle: 'camera_large',
          showPreview: true,
        },
      },
      gallery_first: {
        weight: 25,
        config: {
          showCameraFirst: false,
          buttonStyle: 'gallery_large',
          showPreview: false,
        },
      },
    },
  });

  // Test 2: Dietary restrictions selection UI
  abTesting.registerTest('dietary_ui_mobile', {
    name: 'Dietary UI Mobile',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          layout: 'grid',
          showIcons: false,
          maxPerRow: 2,
          animation: 'fade',
        },
      },
      icons: {
        weight: 25,
        config: {
          layout: 'grid',
          showIcons: true,
          maxPerRow: 2,
          animation: 'slide',
        },
      },
      list: {
        weight: 25,
        config: {
          layout: 'list',
          showIcons: true,
          maxPerRow: 1,
          animation: 'scale',
        },
      },
    },
  });

  // Test 3: Recipe result sharing
  abTesting.registerTest('recipe_sharing', {
    name: 'Recipe Sharing',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          showShareButton: true,
          shareButtonStyle: 'primary',
          showSocialOptions: false,
        },
      },
      social: {
        weight: 25,
        config: {
          showShareButton: true,
          shareButtonStyle: 'secondary',
          showSocialOptions: true,
        },
      },
      minimal: {
        weight: 25,
        config: {
          showShareButton: false,
          shareButtonStyle: 'primary',
          showSocialOptions: false,
        },
      },
    },
  });

  // Test 4: Loading state presentation
  abTesting.registerTest('loading_state', {
    name: 'Loading State',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          showProgress: false,
          showTips: false,
          animation: 'spinner',
        },
      },
      progress: {
        weight: 25,
        config: {
          showProgress: true,
          showTips: true,
          animation: 'progress',
        },
      },
      tips: {
        weight: 25,
        config: {
          showProgress: false,
          showTips: true,
          animation: 'pulse',
        },
      },
    },
  });
};

// Export class for custom tests
export { ABTesting };
