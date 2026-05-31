/**
 * Date-fns Mock Implementation
 *
 * Mock implementation of date-fns functions to resolve missing dependency
 */

export const format = (date: Date, _formatStr: string): string => {
  return date.toISOString();
};

export const addDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

export const addMonths = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
};

export const addYears = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + amount);
  return result;
};

export const subDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - amount);
  return result;
};

export const subMonths = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - amount);
  return result;
};

export const subYears = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - amount);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfWeek = (date: Date): Date => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isAfter = (date: Date, dateToCompare: Date): boolean => {
  return date.getTime() > dateToCompare.getTime();
};

export const isBefore = (date: Date, dateToCompare: Date): boolean => {
  return date.getTime() < dateToCompare.getTime();
};

export const isEqual = (dateLeft: Date, dateRight: Date): boolean => {
  return dateLeft.getTime() === dateRight.getTime();
};

export const differenceInDays = (dateLeft: Date, dateRight: Date): number => {
  const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const differenceInHours = (dateLeft: Date, dateRight: Date): number => {
  const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60));
};

export const differenceInMinutes = (
  dateLeft: Date,
  dateRight: Date,
): number => {
  const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
  return Math.floor(diffTime / (1000 * 60));
};

export const differenceInSeconds = (
  dateLeft: Date,
  dateRight: Date,
): number => {
  const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
  return Math.floor(diffTime / 1000);
};

export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = differenceInSeconds(now, date);

  if (diffInSeconds < 60) {
    return 'less than a minute ago';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};
