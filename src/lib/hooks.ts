import { useRef, useState, useSyncExternalStore } from 'react';

export function useMedia(query: string) {
  return useSyncExternalStore(
    (listener) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
export function useAction() {
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState('');
  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      return await action();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Something went wrong. Please try again.',
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return { pending, error, run, clear: () => setError('') };
}
