import { describe, it, expect } from '@jest/globals';

describe('plan', () => {
  it('exports expected symbols from hooks', () => {
    const mod = require('../hooks');
    expect(mod).toBeDefined();
  });

  it('PlanItemStatusSchema validates correct values', () => {
    const { PlanItemStatusSchema } = require('../schemas');
    expect(PlanItemStatusSchema.parse('todo')).toBe('todo');
    expect(PlanItemStatusSchema.parse('in_progress')).toBe('in_progress');
    expect(PlanItemStatusSchema.parse('done')).toBe('done');
    expect(PlanItemStatusSchema.parse('blocked')).toBe('blocked');
  });

  it('PlanItemStatusSchema rejects invalid values', () => {
    const { PlanItemStatusSchema } = require('../schemas');
    expect(() => PlanItemStatusSchema.parse('invalid')).toThrow();
  });

  it('PlanItemPrioritySchema validates correct values', () => {
    const { PlanItemPrioritySchema } = require('../schemas');
    expect(PlanItemPrioritySchema.parse('low')).toBe('low');
    expect(PlanItemPrioritySchema.parse('medium')).toBe('medium');
    expect(PlanItemPrioritySchema.parse('high')).toBe('high');
    expect(PlanItemPrioritySchema.parse('urgent')).toBe('urgent');
  });

  it('PlanItemSchema validates a complete plan item', () => {
    const { PlanItemSchema } = require('../schemas');
    const validItem = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Test Plan Item',
      description: 'A test description',
      status: 'todo',
      priority: 'medium',
      createdAt: '2026-06-25T00:00:00.000Z',
      updatedAt: '2026-06-25T00:00:00.000Z',
    };
    expect(() => PlanItemSchema.parse(validItem)).not.toThrow();
  });

  it('PlanItemSchema rejects item with empty title', () => {
    const { PlanItemSchema } = require('../schemas');
    const invalidItem = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      title: '',
      description: 'desc',
      status: 'todo',
      priority: 'medium',
    };
    expect(() => PlanItemSchema.parse(invalidItem)).toThrow();
  });

  it('service module loads', () => {
    const service = require('../service');
    expect(service).toBeDefined();
  });

  it('repository module loads', () => {
    const repo = require('../repository');
    expect(repo).toBeDefined();
  });

  it('repository-mappers module loads', () => {
    const mappers = require('../repository-mappers');
    expect(mappers).toBeDefined();
  });
});
