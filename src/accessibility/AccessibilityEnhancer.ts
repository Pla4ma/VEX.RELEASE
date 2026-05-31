import React from "react";
import { createDebugger } from "../utils/debug";
import type {
  EnhancedAccessibilityProps,
  AccessibilityEnhancementConfig,
  EnhancementHistoryEntry,
} from "./AccessibilityEnhancerTypes";
import {
  getContrastEnhancements,
  getFocusEnhancements,
  getMotionEnhancements,
  getScreenReaderEnhancements,
} from "./AccessibilityEnhancerHelpers";

const debug = createDebugger("accessibility-enhancer");

export class AccessibilityEnhancer {
  private static instance: AccessibilityEnhancer;
  private config: AccessibilityEnhancementConfig;
  private enhancementHistory: EnhancementHistoryEntry[] = [];

  private constructor() {
    this.config = {
      autoContrastFixes: true,
      autoFocusManagement: true,
      motionOptimizations: true,
      screenReaderOptimizations: true,
      colorBlindSupport: "none",
    };
  }

  static getInstance(): AccessibilityEnhancer {
    if (!AccessibilityEnhancer.instance) {
      AccessibilityEnhancer.instance = new AccessibilityEnhancer();
    }
    return AccessibilityEnhancer.instance;
  }

  setConfig(config: Partial<AccessibilityEnhancementConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info("Accessibility enhancer configuration updated:", this.config);
  }

  getConfig(): AccessibilityEnhancementConfig {
    return { ...this.config };
  }

  enhanceComponent<P extends object>(
    Component: React.ComponentType<P>,
    enhancements?: Partial<EnhancedAccessibilityProps>,
  ): React.ComponentType<P> {
    const EnhancedComponent = React.forwardRef<unknown, P>((props, ref) => {
      const enhancedProps = this.enhanceProps(props, enhancements);
      return React.createElement(Component, {
        ...(enhancedProps as P),
        ref: ref as React.Ref<React.ComponentType<P>>,
      });
    });
    const componentRef = Component as {
      displayName?: string;
      name?: string;
    };
    EnhancedComponent.displayName = `Enhanced(${componentRef.displayName || componentRef.name || "Component"})`;
    // TODO(safe-cast): ForwardRefExoticComponent is not part of React.ComponentType union.
    // Proper fix: change return type to ForwardRefExoticComponent<P> or use a typed HOC
    // library. Cast is structurally safe at runtime.
    return EnhancedComponent as unknown as React.ComponentType<P>;
  }

  enhanceProps<P extends object>(
    props: P,
    enhancements?: Partial<EnhancedAccessibilityProps>,
  ): P & EnhancedAccessibilityProps {
    const enhancedProps: EnhancedAccessibilityProps = {
      ...this.getAutomaticEnhancements(props),
      ...enhancements,
    };
    return { ...props, ...enhancedProps } as P & EnhancedAccessibilityProps;
  }

  private getAutomaticEnhancements<P extends object>(
    props: P & Partial<EnhancedAccessibilityProps>,
  ): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};
    if (this.config.autoContrastFixes) {
      Object.assign(enhancements, getContrastEnhancements(props, this.config));
    }
    if (this.config.autoFocusManagement) {
      Object.assign(enhancements, getFocusEnhancements(props));
    }
    if (this.config.motionOptimizations) {
      Object.assign(enhancements, getMotionEnhancements(props));
    }
    if (this.config.screenReaderOptimizations) {
      Object.assign(enhancements, getScreenReaderEnhancements(props));
    }
    return enhancements;
  }

  createEnhancedButton<P extends object>(
    ButtonComponent: React.ComponentType<P>,
  ): React.ComponentType<P> {
    return this.enhanceComponent(ButtonComponent, {
      accessibilityRole: "button",
      accessibilityHint: "Performs the associated action",
    });
  }

  createEnhancedInput<P extends object>(
    InputComponent: React.ComponentType<P>,
  ): React.ComponentType<P> {
    return this.enhanceComponent(InputComponent, {
      accessibilityRole: "textbox",
      accessibilityHint: "Opens text input for editing",
    });
  }

  createEnhancedModal<P extends object>(
    ModalComponent: React.ComponentType<P>,
  ): React.ComponentType<P> {
    return this.enhanceComponent(ModalComponent, {
      accessibilityViewIsModal: true,
      accessibilityRole: "dialog",
    });
  }

  createEnhancedList<P extends object>(
    ListComponent: React.ComponentType<P>,
  ): React.ComponentType<P> {
    return this.enhanceComponent(ListComponent, {
      accessibilityRole: "list",
      accessibilityLabel: "List of items",
    });
  }

  getEnhancementHistory(): EnhancementHistoryEntry[] {
    return [...this.enhancementHistory];
  }

  clearEnhancementHistory(): void {
    this.enhancementHistory = [];
    debug.info("Accessibility enhancement history cleared");
  }

  recordEnhancement(enhancement: {
    type: string;
    component: string;
    applied: boolean;
    reason?: string;
  }): void {
    this.enhancementHistory.push({ timestamp: Date.now(), ...enhancement });
    debug.info("Accessibility enhancement recorded:", enhancement);
  }

  performHealthCheck(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    if (!this.config.autoContrastFixes) {
      issues.push("Auto-contrast fixes disabled");
      recommendations.push(
        "Enable auto-contrast fixes for better accessibility",
      );
      score -= 10;
    }
    if (!this.config.autoFocusManagement) {
      issues.push("Auto-focus management disabled");
      recommendations.push(
        "Enable auto-focus management for keyboard navigation",
      );
      score -= 10;
    }
    if (!this.config.motionOptimizations) {
      issues.push("Motion optimizations disabled");
      recommendations.push(
        "Enable motion optimizations for users with vestibular disorders",
      );
      score -= 10;
    }
    if (!this.config.screenReaderOptimizations) {
      issues.push("Screen reader optimizations disabled");
      recommendations.push(
        "Enable screen reader optimizations for better assistive technology support",
      );
      score -= 10;
    }
    if (this.config.colorBlindSupport === "none") {
      recommendations.push(
        "Consider enabling color blind support for inclusivity",
      );
    }
    return { score: Math.max(0, score), issues, recommendations };
  }
}
export const accessibilityEnhancer = AccessibilityEnhancer.getInstance();
export type { EnhancedAccessibilityProps, AccessibilityEnhancement, AccessibilityEnhancementConfig } from "./AccessibilityEnhancerTypes";