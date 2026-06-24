'use strict';

export async function openBrowserAsync() { return { type: 'dismiss' }; }
export async function openAuthSessionAsync() { return { type: 'dismiss' }; }
export async function dismissBrowser() {}
export async function dismissAuthSession() {}
export async function maybeCompleteAuthSession() { return { type: 'success' }; }
export async function warmUpAsync() {}
export async function coolDownAsync() {}
