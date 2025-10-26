import { AggregateType } from "../EventStore/types";

/**
 * Base class for all aggregates following Event Sourcing pattern.
 * Handles event application, uncommitted events tracking, and version management.
 * 
 * @template T The state type of the aggregate
 */
export abstract class AggregateRoot<T> {
  protected uncommitted: any[] = [];
  protected version = 0;
  protected state: T | null = null;

  protected constructor(protected readonly id: string) {}

  /**
   * The aggregate type identifier (e.g., "User", "Member", "Retreat")
   */
  abstract get aggregateType(): AggregateType;

  /**
   * Get the aggregate's unique identifier
   */
  get uuid(): string {
    return this.id;
  }

  /**
   * Get the current version of the aggregate
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * Get a copy of the current state
   */
  getState(): T | null {
    return this.state ? { ...this.state } as T : null;
  }

  /**
   * Get all uncommitted events
   */
  getUncommittedEvents(): any[] {
    return [...this.uncommitted];
  }

  /**
   * Mark all uncommitted events as committed
   */
  markCommitted(): void {
    this.uncommitted = [];
  }

  /**
   * Add a new event to uncommitted events and apply it to state.
   * Use this when creating new events in command methods.
   */
  protected addEvent(event: any): void {
    this.applyEvent(event, true);
    this.uncommitted.push(event);
  }

  /**
   * Apply an event to the aggregate state.
   * Override this to handle specific event types.
   */
  protected abstract apply(event: any): void;

  /**
   * Internal event application with version tracking.
   * Calls the subclass's apply() method and increments version.
   */
  private applyEvent(event: any, isNew = false): void {
    this.apply(event);
    if (!isNew) {
      this.version++;
    }
  }

  /**
   * Rebuild aggregate from event history.
   * Call this static method to hydrate an aggregate from stored events.
   */
  protected static replayEvents<A extends AggregateRoot<any>>(
    aggregate: A,
    events: any[]
  ): A {
    for (const event of events) {
      aggregate.applyEvent(event);
    }
    return aggregate;
  }
}

