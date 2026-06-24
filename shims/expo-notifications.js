'use strict';

const noop = () => {};
const subscription = { remove: noop };

export const AndroidImportance = {};
export const EventSubscriptionVendor = {};
export function addNotificationReceivedListener() { return subscription; }
export function addNotificationResponseReceivedListener() { return subscription; }
export function addPushTokenListener() { return subscription; }
export function removeNotificationSubscription() {}
export function setNotificationHandler() {}
export async function getPermissionsAsync() { return { status: 'granted', granted: true, canAskAgain: true }; }
export async function requestPermissionsAsync() { return getPermissionsAsync(); }
export async function getExpoPushTokenAsync() { return { type: 'expo', data: '' }; }
export async function scheduleNotificationAsync() { return ''; }
export async function cancelScheduledNotificationAsync() {}
export async function cancelAllScheduledNotificationsAsync() {}
export async function getAllScheduledNotificationsAsync() { return []; }
export async function setBadgeCountAsync() { return true; }
export async function getBadgeCountAsync() { return 0; }
