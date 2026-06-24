'use strict';

function createDb() {
  return {
    closeAsync: async () => {},
    execAsync: async () => {},
    getAllAsync: async () => [],
    getFirstAsync: async () => null,
    runAsync: async () => ({ changes: 0, lastInsertRowId: 0 }),
    withTransactionAsync: async (task) => task(),
  };
}

export async function openDatabaseAsync() {
  return createDb();
}
export function openDatabaseSync() {
  return createDb();
}
