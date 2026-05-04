/**
 * WebSocket Service - Real-time Raids & Duels
 * Handles live synchronization for squad raids and head-to-head duels
 */

import { EventEmitter } from 'events';

// ============================================================================
// Types
// ============================================================================

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';

export interface RaidSyncMessage {
  type: 'RAID_DAMAGE' | 'RAID_PHASE_CHANGE' | 'RAID_PARTICIPANT_UPDATE' | 'RAID_COMPLETED';
  raidId: string;
  payload: Record<string, unknown>;
  timestamp: number;
  senderId: string;
}

export interface DuelSyncMessage {
  type: 'DUEL_DAMAGE' | 'DUEL_PHASE_CHANGE' | 'DUEL_LEAD_CHANGE' | 'DUEL_COMPLETED' | 'DUEL_FORFEIT';
  duelId: string;
  payload: Record<string, unknown>;
  timestamp: number;
  senderId: string;
}

// ============================================================================
// WebSocket Service
// ============================================================================

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private status: ConnectionStatus = 'DISCONNECTED';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private messageQueue: Array<RaidSyncMessage | DuelSyncMessage> = [];

  constructor(config: Partial<WebSocketConfig> = {}) {
    super();
    this.config = {
      url: config.url || process.env.WS_URL || 'wss://api.vex.app/realtime',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  connect(userId: string, token: string): void {
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      return;
    }

    this.userId = userId;
    this.status = 'CONNECTING';
    this.emit('statusChange', this.status);

    try {
      const url = `${this.config.url}?userId=${userId}&token=${token}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      this.handleError(error as Event);
    }
  }

  disconnect(): void {
    this.clearTimers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.status = 'DISCONNECTED';
    this.reconnectAttempts = 0;
    this.emit('statusChange', this.status);
  }

  private handleOpen(): void {
    this.status = 'CONNECTED';
    this.reconnectAttempts = 0;
    this.emit('statusChange', this.status);
    this.emit('connected');

    // Send any queued messages
    this.flushMessageQueue();

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as RaidSyncMessage | DuelSyncMessage;

      // Don't process our own messages
      if (message.senderId === this.userId) {
        return;
      }

      this.emit('message', message);

      // Emit specific events
      if (message.type.startsWith('RAID_')) {
        this.emit('raidMessage', message as RaidSyncMessage);
      } else if (message.type.startsWith('DUEL_')) {
        this.emit('duelMessage', message as DuelSyncMessage);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers();

    if (this.status === 'CONNECTED') {
      this.emit('disconnected', event);

      // Attempt to reconnect
      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.attemptReconnect();
      } else {
        this.status = 'DISCONNECTED';
        this.emit('statusChange', this.status);
        this.emit('maxReconnectReached');
      }
    }
  }

  private handleError(event: Event): void {
    this.emit('error', event);
  }

  // ========================================================================
  // Reconnection Logic
  // ========================================================================

  private attemptReconnect(): void {
    this.status = 'RECONNECTING';
    this.emit('statusChange', this.status);

    this.reconnectAttempts++;
    this.emit('reconnecting', this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      if (this.userId) {
        // Get a fresh token - in production this would call your auth service
        this.connect(this.userId, 'refresh-token');
      }
    }, this.config.reconnectInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ========================================================================
  // Heartbeat
  // ========================================================================

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'PING', timestamp: Date.now() });
    }, this.config.heartbeatInterval);
  }

  // ========================================================================
  // Message Sending
  // ========================================================================

  send(message: Record<string, unknown>): boolean {
    const fullMessage = {
      ...message,
      senderId: this.userId,
      timestamp: Date.now(),
    };

    if (this.status === 'CONNECTED' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
      return true;
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(fullMessage as RaidSyncMessage | DuelSyncMessage);
      return false;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.status === 'CONNECTED') {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws?.send(JSON.stringify(message));
      }
    }
  }

  // ========================================================================
  // Raid Methods
  // ========================================================================

  sendRaidDamage(raidId: string, damage: number, bossHealthAfter: number): void {
    this.send({
      type: 'RAID_DAMAGE',
      raidId,
      payload: { damage, bossHealthAfter },
    });
  }

  sendRaidPhaseChange(raidId: string, phase: number, mechanic: string): void {
    this.send({
      type: 'RAID_PHASE_CHANGE',
      raidId,
      payload: { phase, mechanic },
    });
  }

  sendRaidParticipantUpdate(
    raidId: string,
    participantId: string,
    update: { isReady?: boolean; isPresent?: boolean; damageDealt?: number }
  ): void {
    this.send({
      type: 'RAID_PARTICIPANT_UPDATE',
      raidId,
      payload: { participantId, ...update },
    });
  }

  sendRaidCompleted(raidId: string, victory: boolean, rewards: unknown): void {
    this.send({
      type: 'RAID_COMPLETED',
      raidId,
      payload: { victory, rewards },
    });
  }

  // ========================================================================
  // Duel Methods
  // ========================================================================

  sendDuelDamage(duelId: string, damage: number, bossHealthAfter: number, totalDamage: number): void {
    this.send({
      type: 'DUEL_DAMAGE',
      duelId,
      payload: { damage, bossHealthAfter, totalDamage },
    });
  }

  sendDuelPhaseChange(duelId: string, phase: number): void {
    this.send({
      type: 'DUEL_PHASE_CHANGE',
      duelId,
      payload: { phase },
    });
  }

  sendDuelLeadChange(duelId: string, newLeaderId: string, leadChanges: number): void {
    this.send({
      type: 'DUEL_LEAD_CHANGE',
      duelId,
      payload: { newLeaderId, leadChanges },
    });
  }

  sendDuelCompleted(
    duelId: string,
    winnerId: string | null,
    reason: string,
    finalStats: Record<string, unknown>
  ): void {
    this.send({
      type: 'DUEL_COMPLETED',
      duelId,
      payload: { winnerId, reason, finalStats },
    });
  }

  sendDuelForfeit(duelId: string, forfeitReason: string): void {
    this.send({
      type: 'DUEL_FORFEIT',
      duelId,
      payload: { reason: forfeitReason },
    });
  }

  // ========================================================================
  // Getters
  // ========================================================================

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'CONNECTED';
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

// ============================================================================
// Singleton
// ============================================================================

let serviceInstance: WebSocketService | null = null;

export function getWebSocketService(config?: Partial<WebSocketConfig>): WebSocketService {
  if (!serviceInstance) {
    serviceInstance = new WebSocketService(config);
  }
  return serviceInstance;
}

export function resetWebSocketService(): void {
  serviceInstance?.disconnect();
  serviceInstance = null;
}
