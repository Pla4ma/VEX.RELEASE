

export class RateLimiter {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  canProceed(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old requests outside window
    this.requests = this.requests.filter((time) => time > windowStart);

    return this.requests.length < this.maxRequests;
  }

  async acquire(): Promise<void> {
    while (!this.canProceed()) {
      await sleep(100);
    }
    this.requests.push(Date.now());
  }
}