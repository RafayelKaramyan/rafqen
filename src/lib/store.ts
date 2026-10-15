import { useSyncExternalStore } from 'react';
import { freshState, stateSchema, type ShopState } from './commerce';

export const storageKey = 'rafqen:store:v1';
type Snapshot = { data: ShopState; issue: string | null };
let snapshot: Snapshot = { data: freshState(), issue: null };
const listeners = new Set<() => void>();
function read(): ShopState {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    throw new Error(
      'Browser storage is unavailable. Allow storage to keep your bag and saved builds.',
    );
  }
  if (raw === null) return freshState();
  try {
    return stateSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      'Your saved bag could not be read. Reset demo data to start again. Your current data has been kept.',
    );
  }
}
function publish(data: ShopState, issue: string | null = null) {
  snapshot = { data, issue };
  listeners.forEach((listener) => listener());
}
export function initializeStore() {
  try {
    publish(read());
  } catch (error) {
    publish(freshState(), (error as Error).message);
  }
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
      try {
        publish(read());
      } catch (error) {
        publish(snapshot.data, (error as Error).message);
      }
    }
  });
}
function persist(data: ShopState) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    throw new Error('Your changes could not be saved. Free some browser storage and try again.');
  }
  publish(data);
}
export async function updateStore<T>(
  change: (current: ShopState) => { state: ShopState; value: T },
): Promise<T> {
  const transact = () => {
    const current = read(),
      result = change(current);
    const next = stateSchema.parse({ ...result.state, revision: current.revision + 1 });
    persist(next);
    return result.value;
  };
  return navigator.locks ? navigator.locks.request(storageKey, transact) : transact();
}
export function mutateStore(change: (current: ShopState) => ShopState) {
  return updateStore((current) => ({ state: change(current), value: undefined }));
}
export function resetStore() {
  const reset = () => persist(freshState());
  return navigator.locks
    ? navigator.locks.request(storageKey, reset)
    : Promise.resolve().then(reset);
}
export function useShop() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
  );
}
