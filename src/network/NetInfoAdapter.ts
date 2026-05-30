/**
 * NetInfo Adapter
 *
 * Network connectivity monitoring and management.
 */

import type { Nullable } from "../types/global";
import type {
  NetInfoState,
  NetInfoSubscription,
} from "@react-native-community/netinfo";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("network:netinfo");

/**
 * Network state
 */
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: unknown | null;
}

/**
 * Network change callback
 */
export type NetworkChangeCallback = (state: NetworkState) => void;

/**
 * NetInfo adapter
 */
export class NetInfoAdapter {
  private netInfo: unknown | null = null;
  private subscribers: Set<NetworkChangeCallback> = new Set();
  private unsubscribe: (() => void) | null = null;
  private initialized = false;
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: "unknown",
    details: null,
  };

  /**
   * Initialize NetInfo
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const NetInfo = require("@react-native-community/netinfo").default;
      this.netInfo = NetInfo;

      // Subscribe to network changes
      this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        this.handleNetworkChange(state);
      }) as () => void;

      // Get initial state
      const initialState = await NetInfo["fetch"]();
      this.handleNetworkChange(initialState);
    } catch (error) {
      debug.error("Failed to initialize NetInfo:", error as Error);
    }
  }

  /**
   * Handle network state change
   */
  private handleNetworkChange(state: NetInfoState): void {
    this.currentState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details ?? null,
    };

    // Notify all subscribers
    this.subscribers.forEach((callback) => {
      try {
        callback(this.currentState);
      } catch (error) {
        debug.error("Error in network change callback:", error as Error);
      }
    });
  }

  /**
   * Subscribe to network changes
   */
  subscribe(callback: NetworkChangeCallback): () => void {
    this.subscribers.add(callback);

    // Immediately call with current state
    callback(this.currentState);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current network state
   */
  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.currentState.isConnected;
  }

  /**
   * Check if internet is reachable
   */
  isInternetReachable(): boolean {
    return this.currentState.isInternetReachable ?? false;
  }

  /**
   * Get connection type
   */
  getConnectionType(): string {
    return this.currentState.type;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.subscribers.clear();
    this.initialized = false;
  }
}

/**
 * Singleton instance
 */
let netInfoInstance: NetInfoAdapter | null = null;

export function getNetInfoAdapter(): NetInfoAdapter {
  if (!netInfoInstance) {
    netInfoInstance = new NetInfoAdapter();
  }
  return netInfoInstance;
}
