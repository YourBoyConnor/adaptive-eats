interface ABTestConfig {
  name: string;
  variants: {
    [key: string]: {
      weight: number;
      config: Record<string, unknown>;
    };
  };
  enabled: boolean;
}

interface ABTestResult {
  variant: string;
  config: Record<string, unknown>;
  testName: string;
}

class ABTesting {
  private tests: Map<string, ABTestConfig> = new Map();
  private assignments: Map<string, string> = new Map();

  // Register a new A/B test
  registerTest(testName: string, config: ABTestConfig) {
    this.tests.set(testName, config);
  }

  // Get variant for a user
  getVariant(testName: string, userId?: string): ABTestResult | null {
    const test = this.tests.get(testName);
    if (!test || !test.enabled) {
      return null;
    }

    // Use userId or generate a stable identifier
    const identifier = userId || this.getStableIdentifier();
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

    return {
      variant,
      config: test.variants[variant].config,
      testName,
    };
  }

  // Select variant based on weights
  private selectVariant(variants: { [key: string]: { weight: number; config: Record<string, unknown> } }): string {
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
  private getStableIdentifier(): string {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      let identifier = localStorage.getItem('ab_test_identifier');
      if (!identifier) {
        identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ab_test_identifier', identifier);
      }
      return identifier;
    }
    
    // Fallback for SSR
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    // Track with analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        test_name: testName,
        variant,
        conversion_type: conversionType,
        value,
      });
    }
  }

  // Get all active tests
  getActiveTests(): ABTestConfig[] {
    return Array.from(this.tests.values()).filter(test => test.enabled);
  }

  // Clear assignments (useful for testing)
  clearAssignments() {
    this.assignments.clear();
  }
}

// Export singleton instance
export const abTesting = new ABTesting();

// Predefined tests for AdaptiveEats
export const initializeABTests = () => {
  // Test 1: Recipe input method prominence
  abTesting.registerTest('recipe_input_prominence', {
    name: 'Recipe Input Prominence',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          showImageFirst: false,
          imageButtonSize: 'normal',
          textInputPlaceholder: 'Paste your recipe here...',
        },
      },
      image_first: {
        weight: 25,
        config: {
          showImageFirst: true,
          imageButtonSize: 'large',
          textInputPlaceholder: 'Or paste your recipe here...',
        },
      },
      text_first: {
        weight: 25,
        config: {
          showImageFirst: false,
          imageButtonSize: 'small',
          textInputPlaceholder: 'Paste your recipe here to get started!',
        },
      },
    },
  });

  // Test 2: Dietary restrictions UI
  abTesting.registerTest('dietary_restrictions_ui', {
    name: 'Dietary Restrictions UI',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          layout: 'grid',
          showIcons: false,
          maxSelections: 5,
        },
      },
      icons: {
        weight: 25,
        config: {
          layout: 'grid',
          showIcons: true,
          maxSelections: 5,
        },
      },
      list: {
        weight: 25,
        config: {
          layout: 'list',
          showIcons: true,
          maxSelections: 10,
        },
      },
    },
  });

  // Test 3: Recipe result presentation
  abTesting.registerTest('recipe_result_presentation', {
    name: 'Recipe Result Presentation',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          showNutritionFirst: false,
          showSubstitutions: true,
          showOriginalRecipe: false,
        },
      },
      nutrition_first: {
        weight: 25,
        config: {
          showNutritionFirst: true,
          showSubstitutions: true,
          showOriginalRecipe: false,
        },
      },
      with_original: {
        weight: 25,
        config: {
          showNutritionFirst: false,
          showSubstitutions: true,
          showOriginalRecipe: true,
        },
      },
    },
  });

  // Test 4: Call-to-action button
  abTesting.registerTest('cta_button', {
    name: 'CTA Button Design',
    enabled: true,
    variants: {
      control: {
        weight: 50,
        config: {
          text: 'Adapt Recipe',
          style: 'gradient',
          size: 'large',
        },
      },
      action_oriented: {
        weight: 25,
        config: {
          text: 'Transform My Recipe',
          style: 'solid',
          size: 'large',
        },
      },
      simple: {
        weight: 25,
        config: {
          text: 'Adapt',
          style: 'outline',
          size: 'medium',
        },
      },
    },
  });
};

// Export class for custom tests
export { ABTesting };
