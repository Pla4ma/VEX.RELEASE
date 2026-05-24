import { registerSchema } from '../schemas';

describe('auth validation schemas', () => {
  it('accepts lightweight registration before profile naming', () => {
    const result = registerSchema.safeParse({
      agreeToTerms: true,
      confirmPassword: 'Focus123!',
      email: 'starter@vex.app',
      firstName: '',
      lastName: '',
      password: 'Focus123!',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('');
      expect(result.data.lastName).toBe('');
    }
  });

  it('keeps password quality and confirmation checks on lightweight registration', () => {
    const weak = registerSchema.safeParse({
      agreeToTerms: true,
      confirmPassword: 'weakpass',
      email: 'starter@vex.app',
      firstName: '',
      lastName: '',
      password: 'weakpass',
    });

    const mismatch = registerSchema.safeParse({
      agreeToTerms: true,
      confirmPassword: 'Focus123?',
      email: 'starter@vex.app',
      firstName: '',
      lastName: '',
      password: 'Focus123!',
    });

    expect(weak.success).toBe(false);
    expect(mismatch.success).toBe(false);
  });
});
