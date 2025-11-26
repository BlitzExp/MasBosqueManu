type CleanupFn = () => void;

const fns = new Set<CleanupFn>();

export function registerRealtimeCleanup(fn: CleanupFn) {
  fns.add(fn);
  return () => fns.delete(fn);
}

export function cleanupRealtimeSubscriptions() {
  for (const fn of Array.from(fns)) {
    try {
      fn();
    } catch (e) {
      // ignore
    }
  }
  fns.clear();
}

export function clearRealtimeCleanupRegistry() {
  fns.clear();
}
