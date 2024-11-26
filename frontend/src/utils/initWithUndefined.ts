/**
 * Creates an object with all fields initialized to "undefined".
 */
export function initializeObjectWithUndefined<T>(keys: (keyof T)[]): T {
  const result: Partial<T> = {};
  keys.forEach(key => {
    result[key] = undefined;
  });
  return result as T;
}