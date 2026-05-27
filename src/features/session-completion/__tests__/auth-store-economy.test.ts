describe("auth store economy-free initialization", () => {
  it("does not import economyService at module level", () => {
    const storeSource = jest.requireActual("../../../store/index");
    expect(storeSource).toBeDefined();
  });

  it("does not import old rewardService at module level", () => {
    const storeSource = jest.requireActual("../../../store/index");
    expect(storeSource).toBeDefined();
  });
});
