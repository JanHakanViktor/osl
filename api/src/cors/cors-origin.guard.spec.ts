import { describe, expect, it } from '@jest/globals';
import { isAllowedCorsOrigin } from './cors-origin.guard';

describe('isAllowedCorsOrigin', () => {
  it('allows browserless requests without an origin header', () => {
    expect(isAllowedCorsOrigin(undefined)).toBe(true);
  });

  it('allows localhost development origins on any port', () => {
    expect(isAllowedCorsOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedCorsOrigin('http://localhost:5173')).toBe(true);
  });

  it('allows 127.0.0.1 development origins on any port', () => {
    expect(isAllowedCorsOrigin('http://127.0.0.1:3002')).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:5173')).toBe(true);
  });

  it('allows production origins', () => {
    expect(isAllowedCorsOrigin('https://osl-f1.com')).toBe(true);
    expect(isAllowedCorsOrigin('https://www.osl-f1.com')).toBe(true);
  });

  it('blocks unknown origins', () => {
    expect(isAllowedCorsOrigin('https://example.com')).toBe(false);
  });
});
