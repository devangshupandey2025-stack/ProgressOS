type EventPayload = Record<string, any>;

type EventHandler<T = any> = (payload: T) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on(event: string, handler: EventHandler): void {
    const existing = this.handlers.get(event) || [];
    existing.push(handler);
    this.handlers.set(event, existing);
  }

  off(event: string, handler: EventHandler): void {
    const existing = this.handlers.get(event) || [];
    this.handlers.set(event, existing.filter(h => h !== handler));
  }

  async emit(event: string, payload: EventPayload): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    await Promise.allSettled(handlers.map(h => h(payload)));
  }
}

export const eventBus = new EventBus();

// ─── Event Names ─────────────────────────────────────────────────────────────

export const Events = {
  ACTIVITY_LOGGED: 'ACTIVITY_LOGGED',
  LEETCODE_SOLVED: 'LEETCODE_SOLVED',
  GOAL_COMPLETED: 'GOAL_COMPLETED',
  ATTENDANCE_RECORDED: 'ATTENDANCE_RECORDED',
  XP_AWARDED: 'XP_AWARDED',
} as const;
