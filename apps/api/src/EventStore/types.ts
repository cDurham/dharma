export type AggregateId = string;

/**
 * All possible aggregate types in the system.
 * Add new types here as you create new aggregates.
 */
export type AggregateType = 'User' | 'Member' | 'Retreat';

/**
 * Type guard to validate aggregate type at runtime
 */
export function isValidAggregateType(value: string): value is AggregateType {
  return value === 'User' || value === 'Member' || value === 'Retreat';
}

export interface DomainEvent<TPayload = any> {
  aggregateId: AggregateId;
  aggregateType: AggregateType;
  eventType: string; // usually the class name, e.g., "UserCreatedEvent"
  payload: TPayload;
  metadata?: Record<string, any>;
  version?: number;
}

export interface EventEnvelope<TPayload = any> {
  id: string;
  aggregateId: AggregateId;
  aggregateType: AggregateType;
  eventType: string;
  payload: TPayload;
  metadata: Record<string, any>;
  version: number;
  occurredAt: Date;
}

export type OutboxRecord = {
  id: string;
  aggregateId: AggregateId;
  eventType: string;
  payload: any;
  status: "pending" | "processed" | "failed";
  createdAt: Date;
  processedAt: Date | null;
};

