// Re-export shim. Canonical implementation lives at src/utils/debug.ts;
// tests jest.mock('../../../utils/debug')?relative?path — this file exists
// because historical tests reference the shared-utils path; we forward.
export * from '../../utils/debug';
