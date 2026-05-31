import { describe, it, expect } from '@jest/globals';
import {
  capitalize,
  titleCase,
  truncate,
  removeWhitespace,
  slugify,
  kebabCase,
  camelCase,
} from '../string';

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });
  it('does not alter already-capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });
  it('does not lowercase the rest of the string', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });
});

describe('titleCase', () => {
  it('converts every word to title case', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });
  it('returns empty string for empty input', () => {
    expect(titleCase('')).toBe('');
  });
  it('handles single word', () => {
    expect(titleCase('react')).toBe('React');
  });
  it('lowercases words before capitalizing', () => {
    expect(titleCase('HELLO WORLD')).toBe('Hello World');
  });
});

describe('truncate', () => {
  it('truncates long strings with ellipsis', () => {
    expect(truncate('Hello, World!', 8)).toBe('Hello...');
  });
  it('returns the original string when within maxLength', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
  it('returns the original string when equal to maxLength', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
  it('returns empty string for empty input', () => {
    expect(truncate('', 5)).toBe('');
  });
  it('handles maxLength exactly at boundary', () => {
    const result = truncate('abcdefghij', 6);
    expect(result).toBe('abc...');
    expect(result.length).toBe(6);
  });
});

describe('removeWhitespace', () => {
  it('removes all whitespace characters', () => {
    expect(removeWhitespace('  hello  world  ')).toBe('helloworld');
  });
  it('handles tabs and newlines', () => {
    expect(removeWhitespace('hello\tworld\n')).toBe('helloworld');
  });
  it('returns empty string for whitespace-only input', () => {
    expect(removeWhitespace('   ')).toBe('');
  });
  it('returns unchanged string with no whitespace', () => {
    expect(removeWhitespace('hello')).toBe('hello');
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });
  it('collapses multiple hyphens', () => {
    expect(slugify('hello  world')).toBe('hello-world');
  });
  it('strips leading and trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello');
  });
  it('lowercases the result', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });
});

describe('kebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world');
  });
  it('converts PascalCase to kebab-case', () => {
    expect(kebabCase('HelloWorld')).toBe('hello-world');
  });
  it('converts underscores to hyphens', () => {
    expect(kebabCase('hello_world')).toBe('hello-world');
  });
  it('lowercases the result', () => {
    expect(kebabCase('HELLO')).toBe('hello');
  });
});

describe('camelCase', () => {
  it('converts kebab-case to camelCase', () => {
    expect(camelCase('hello-world')).toBe('helloWorld');
  });
  it('converts snake_case to camelCase', () => {
    expect(camelCase('hello_world')).toBe('helloWorld');
  });
  it('converts space-separated words to camelCase', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
  });
  it('lowercases the first character', () => {
    expect(camelCase('Hello-World')).toBe('helloWorld');
  });
});
