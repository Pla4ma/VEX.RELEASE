'use strict';

const store = new Map();

export async function getItemAsync(key) {
  return store.get(key) ?? null;
}
export async function setItemAsync(key, value) {
  store.set(key, String(value));
}
export async function deleteItemAsync(key) {
  store.delete(key);
}
export function getItem(key) {
  return store.get(key) ?? null;
}
export function setItem(key, value) {
  store.set(key, String(value));
}
export function deleteItem(key) {
  store.delete(key);
}
export async function isAvailableAsync() {
  return true;
}
export const AFTER_FIRST_UNLOCK = 'AFTER_FIRST_UNLOCK';
export const WHEN_UNLOCKED = 'WHEN_UNLOCKED';
