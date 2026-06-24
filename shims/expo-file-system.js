'use strict';

export const documentDirectory = '';
export const cacheDirectory = '';

export async function getInfoAsync() { return { exists: false, uri: '', size: 0, isDirectory: false, modificationTime: 0 }; }
export async function readAsStringAsync() { return ''; }
export async function writeAsStringAsync() {}
export async function deleteAsync() {}
export async function makeDirectoryAsync() {}
export async function readDirectoryAsync() { return []; }
export async function downloadAsync() { return { uri: '', status: 0, headers: {}, md5: '' }; }
export async function uploadAsync() { return { status: 0, headers: {} }; }
export async function copyAsync() {}
export async function moveAsync() {}

export const EncodingType = { UTF8: 'utf8', Base64: 'base64' };
