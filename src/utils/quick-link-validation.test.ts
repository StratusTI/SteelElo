import { describe, expect, it } from 'vitest';
import { validateUrl } from './quick-link-validation';

describe('Quick Link Validation', () => {
  describe('validateUrl', () => {
    it('should return true for valid https URL', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('https://www.example.com')).toBe(true);
      expect(validateUrl('https://example.com/path')).toBe(true);
      expect(validateUrl('https://example.com/path?query=value')).toBe(true);
      expect(validateUrl('https://example.com:8080')).toBe(true);
    });

    it('should return true for valid http URL', () => {
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('http://localhost')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('should return false for invalid URL format', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('www.example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });

    it('should return false for non-http protocols', () => {
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('file:///path/to/file')).toBe(false);
      expect(validateUrl('mailto:test@example.com')).toBe(false);
      expect(validateUrl('javascript:alert(1)')).toBe(false);
    });

    it('should handle URLs with special characters', () => {
      expect(validateUrl('https://example.com/path%20with%20spaces')).toBe(true);
      expect(validateUrl('https://example.com/path?q=hello+world')).toBe(true);
      expect(validateUrl('https://example.com/#section')).toBe(true);
    });
  });
});
