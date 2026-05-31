/**
 * Repository Helper Tests (getBucketTimestamp, aggregateDataPoints)
 */

import {
  aggregateDataPoints,
  getBucketTimestamp,
} from '../repository/helpers';

describe('Repository Helpers', () => {
  describe('getBucketTimestamp', () => {
    it('floors to hour for hour granularity', () => {
      const ts = new Date('2024-06-15T14:37:00Z').getTime();
      const bucket = getBucketTimestamp(ts, 'hour');
      const bucketDate = new Date(bucket);
      expect(bucketDate.getUTCMinutes()).toBe(0);
      expect(bucketDate.getUTCSeconds()).toBe(0);
    });

    it('floors to day for day granularity', () => {
      const ts = new Date('2024-06-15T14:37:00Z').getTime();
      const bucket = getBucketTimestamp(ts, 'day');
      const bucketDate = new Date(bucket);
      expect(bucketDate.getHours()).toBe(0);
    });

    it('floors to month for month granularity', () => {
      const ts = new Date('2024-06-15T14:37:00Z').getTime();
      const bucket = getBucketTimestamp(ts, 'month');
      const bucketDate = new Date(bucket);
      expect(bucketDate.getDate()).toBe(1);
    });
  });

  describe('aggregateDataPoints', () => {
    it('aggregates single point', () => {
      const rawData = [{ timestamp: Date.now(), value: 10 }];
      const result = aggregateDataPoints(rawData, 'day', 'sessions_completed');
      expect(result.points.length).toBe(1);
      expect(result.summary.total).toBe(10);
    });

    it('aggregates multiple points in same bucket', () => {
      const ts1 = new Date('2024-06-15T10:00:00Z').getTime();
      const ts2 = new Date('2024-06-15T11:00:00Z').getTime();
      const rawData = [
        { timestamp: ts1, value: 5 },
        { timestamp: ts2, value: 10 },
      ];
      const result = aggregateDataPoints(rawData, 'day', 'sessions_completed');
      expect(result.points.length).toBe(1);
      expect(result.summary.total).toBe(15);
    });

    it('aggregates points in different day buckets', () => {
      const ts1 = new Date('2024-06-15T10:00:00Z').getTime();
      const ts2 = new Date('2024-06-16T10:00:00Z').getTime();
      const rawData = [
        { timestamp: ts1, value: 5 },
        { timestamp: ts2, value: 10 },
      ];
      const result = aggregateDataPoints(rawData, 'day', 'sessions_completed');
      expect(result.points.length).toBe(2);
      expect(result.summary.total).toBe(15);
      expect(result.summary.min).toBe(5);
      expect(result.summary.max).toBe(10);
    });

    it('calculates change from first to last point', () => {
      const ts1 = new Date('2024-06-15T10:00:00Z').getTime();
      const ts2 = new Date('2024-06-16T10:00:00Z').getTime();
      const rawData = [
        { timestamp: ts1, value: 5 },
        { timestamp: ts2, value: 15 },
      ];
      const result = aggregateDataPoints(rawData, 'day', 'sessions_completed');
      expect(result.summary.change).toBe(10);
      expect(result.summary.changePercent).toBe(200);
    });

    it('handles empty raw data', () => {
      const result = aggregateDataPoints([], 'day', 'sessions_completed');
      expect(result.points.length).toBe(0);
      expect(result.summary.total).toBe(0);
      expect(result.summary.average).toBe(0);
    });

    it('averages for average metric type', () => {
      const ts1 = new Date('2024-06-15T10:00:00Z').getTime();
      const ts2 = new Date('2024-06-15T11:00:00Z').getTime();
      const rawData = [
        { timestamp: ts1, value: 10 },
        { timestamp: ts2, value: 20 },
      ];
      const result = aggregateDataPoints(
        rawData,
        'day',
        'average_session_duration',
      );
      // average_session_duration includes "average" so should divide by count
      expect(result.points[0]!.value).toBe(15);
    });
  });
});
