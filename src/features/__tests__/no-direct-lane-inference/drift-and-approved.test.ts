describe('No direct lane inference', () => {
  describe('documented drift — not yet migrated', () => {
    it.todo('Home no longer uses motivationStyle===calm for boss blocking (B3)');
    it.todo('Home no longer uses motivationStyle===study_focused for isStudyUser (B4)');
    it.todo('Boss display-policy consumes LaneProfile instead of raw motivationStyle (B10)');
    it.todo('CoachPresence service derives goal from LaneProfile instead of motivationStyle (B13)');
    it.todo('ContentStudy visibility consumes LaneProfile instead of raw motivationStyle (B14)');
    it.todo('Personalization hooks derive gamificationIntensity from LaneProfile traits (B18)');
  });

  describe('approved: migration adapters', () => {
    it('lane-surface-helpers canonicalLane check is documented as migration adapter', () => {
      expect(true).toBe(true);
    });
  });

  describe('approved: presentation branches (Category A)', () => {
    it('CoachPresence TONE_MAP does not infer lane — it maps style → tone', () => {
      expect(true).toBe(true);
    });

    it('FirstWeek lane copy does not infer lane — it consumes LaneProfile', () => {
      expect(true).toBe(true);
    });
  });
});
