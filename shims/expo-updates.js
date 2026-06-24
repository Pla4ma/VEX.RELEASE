'use strict';

export const isEnabled = false;
export const isEmbeddedLaunch = true;
export const updateId = null;
export async function checkForUpdateAsync() { return { isAvailable: false }; }
export async function fetchUpdateAsync() { return { isNew: false }; }
export async function reloadAsync() {}
