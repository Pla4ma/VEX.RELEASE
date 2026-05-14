import { calculateFocusDNAReport } from '../focus-dna-service';
import { FocusDNAReportSchema } from '../schemas';

describe('FocusDNAReport Generator', () => {
  const mockUserId = 'user-123';
  
  const mockSessions = [
    { 
      completedAt: Date.now() - 3600000, 
      duration: 3600, 
      qualityScore: 90, 
      sessionMode: 'DEEP_WORK' 
    },
    { 
      completedAt: Date.now() - 86400000, 
      duration: 1800, 
      qualityScore: 80, 
      sessionMode: 'ZEN' 
    }
  ];

  it('should calculate correct consistency score', async () => {
    // Consistency = sessions / periodDays * 100
    const periodDays = 7;
    const report = await calculateFocusDNAReport(mockUserId, periodDays, mockSessions as any);
    
    expect(report.consistencyScore).toBeGreaterThan(0);
    expect(report.consistencyScore).toBeLessThanOrEqual(100);
    expect(FocusDNAReportSchema.safeParse(report).success).toBe(true);
  });

  it('should identify the correct peak focus hour', async () => {
    const fixedSessions = [
      { completedAt: new Date(2024, 0, 1, 9, 0).getTime(), duration: 3600, qualityScore: 90 },
      { completedAt: new Date(2024, 0, 2, 9, 0).getTime(), duration: 3600, qualityScore: 95 },
      { completedAt: new Date(2024, 0, 3, 15, 0).getTime(), duration: 1800, qualityScore: 80 },
    ];
    
    const report = await calculateFocusDNAReport(mockUserId, 30, fixedSessions as any);
    expect(report.peakFocusHour).toBe(9);
  });

  it('should assign correct tier based on consistency', async () => {
    // High consistency = Monk
    const monkSessions = Array.from({ length: 30 }, (_, i) => ({
      completedAt: Date.now() - i * 86400000,
      duration: 3600,
      qualityScore: 90
    }));
    
    const report = await calculateFocusDNAReport(mockUserId, 30, monkSessions as any);
    expect(report.tier).toBe('Monk');
  });
});
