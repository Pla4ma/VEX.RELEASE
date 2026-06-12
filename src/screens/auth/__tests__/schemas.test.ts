import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas';

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('rejects empty email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 chars', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'short' });
      expect(result.success).toBe(false);
    });

    it('defaults rememberMe to false', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(false);
      }
    });

    it('accepts rememberMe true', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123', rememberMe: true });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(true);
      }
    });
  });

  describe('registerSchema', () => {
    const validRegister = {
      email: 'test@example.com',
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
      firstName: 'John',
      lastName: 'Doe',
      agreeToTerms: true,
    };

    it('validates correct register data', () => {
      const result = registerSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it('rejects when passwords do not match', () => {
      const result = registerSchema.safeParse({ ...validRegister, confirmPassword: 'Different1!' });
      expect(result.success).toBe(false);
    });

    it('rejects when terms not agreed', () => {
      const result = registerSchema.safeParse({ ...validRegister, agreeToTerms: false });
      expect(result.success).toBe(false);
    });

    it('rejects weak password (no uppercase)', () => {
      const result = registerSchema.safeParse({ ...validRegister, password: 'test1234!', confirmPassword: 'test1234!' });
      expect(result.success).toBe(false);
    });

    it('rejects weak password (no special char)', () => {
      const result = registerSchema.safeParse({ ...validRegister, password: 'Test12345', confirmPassword: 'Test12345' });
      expect(result.success).toBe(false);
    });

    it('rejects weak password (no number)', () => {
      const result = registerSchema.safeParse({ ...validRegister, password: 'Testtest!', confirmPassword: 'Testtest!' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({ ...validRegister, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('accepts empty first/last name', () => {
      const result = registerSchema.safeParse({ ...validRegister, firstName: '', lastName: '' });
      expect(result.success).toBe(true);
    });

    it('rejects name with invalid characters', () => {
      const result = registerSchema.safeParse({ ...validRegister, firstName: 'John123' });
      expect(result.success).toBe(false);
    });

    it('accepts valid phone number', () => {
      const result = registerSchema.safeParse({ ...validRegister, phone: '+1 555-123-4567' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid phone number', () => {
      const result = registerSchema.safeParse({ ...validRegister, phone: 'abc' });
      expect(result.success).toBe(false);
    });

    it('accepts empty phone', () => {
      const result = registerSchema.safeParse({ ...validRegister, phone: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates correct email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'not-email' });
      expect(result.success).toBe(false);
    });

    it('rejects empty email', () => {
      const result = forgotPasswordSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    const validReset = {
      password: 'NewPass1!',
      confirmPassword: 'NewPass1!',
      token: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('validates correct reset data', () => {
      const result = resetPasswordSchema.safeParse(validReset);
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({ ...validReset, confirmPassword: 'Different1!' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid token format', () => {
      const result = resetPasswordSchema.safeParse({ ...validReset, token: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('rejects empty token', () => {
      const result = resetPasswordSchema.safeParse({ ...validReset, token: '' });
      expect(result.success).toBe(false);
    });

    it('rejects weak password', () => {
      const result = resetPasswordSchema.safeParse({ ...validReset, password: 'weak', confirmPassword: 'weak' });
      expect(result.success).toBe(false);
    });
  });
});
