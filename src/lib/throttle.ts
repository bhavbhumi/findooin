/**
 * throttle / debounce — Client-side rate limiting utilities.
 *
 * Used to prevent rapid-fire API calls from user actions like
 * double-clicking like/bookmark buttons or spamming connection requests.
 */

/**
 * Creates a throttled version of a function that only executes once
 * within the specified delay window. Leading call executes immediately.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    const remaining = delayMs - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      return fn(...args);
    }

    // Schedule trailing call
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }

    return undefined;
  };
}

/**
 * Creates a debounced version of a function that delays execution
 * until after `delayMs` milliseconds have elapsed since the last call.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Action guard: prevents a callback from being called more than once
 * within `cooldownMs`. Useful for button click handlers.
 * Returns false if the action was blocked.
 */
export function createActionGuard(cooldownMs: number = 1000) {
  const lastAction = new Map<string, number>();

  return (actionKey: string): boolean => {
    const now = Date.now();
    const last = lastAction.get(actionKey) ?? 0;
    if (now - last < cooldownMs) return false;
    lastAction.set(actionKey, now);
    return true;
  };
}
