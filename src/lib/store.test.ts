// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { addLine, checkout, freshState } from './commerce';
import { defaultConfig } from './catalog';
import { mutateStore, resetStore, storageKey, updateStore } from './store';
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
describe('persistent shopping state', () => {
  it('reads each transaction from storage and increments revisions', async () => {
    await mutateStore((s) => addLine(s, defaultConfig()));
    await mutateStore((s) => addLine(s, defaultConfig()));
    const state = JSON.parse(localStorage.getItem(storageKey)!);
    expect(state.cart[0].quantity).toBe(2);
    expect(state.revision).toBe(2);
  });
  it('preserves corrupt data until a deliberate reset', async () => {
    localStorage.setItem(storageKey, '{broken');
    await expect(mutateStore((s) => addLine(s, defaultConfig()))).rejects.toThrow(
      'could not be read',
    );
    expect(localStorage.getItem(storageKey)).toBe('{broken');
    await resetStore();
    expect(JSON.parse(localStorage.getItem(storageKey)!).cart).toEqual([]);
  });
  it('never reports a successful write after a quota failure', async () => {
    const before = JSON.stringify(freshState());
    localStorage.setItem(storageKey, before);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    await expect(mutateStore((s) => addLine(s, defaultConfig()))).rejects.toThrow(
      'could not be saved',
    );
    expect(localStorage.getItem(storageKey)).toBe(before);
  });
  it('commits an order once and rejects a repeated submission', async () => {
    await mutateStore((s) => addLine(s, defaultConfig()));
    const expected = JSON.parse(localStorage.getItem(storageKey)!);
    const customer = {
      name: 'Demo Customer',
      email: 'demo@example.test',
      address: '12 Example Street',
      city: 'Yerevan',
      postalCode: '0001',
      country: 'Armenia',
    };
    const order = await updateStore((current) => {
      const result = checkout(current, customer, expected);
      return { state: result.state, value: result.order };
    });
    expect(order.lines).toHaveLength(1);
    await expect(
      updateStore((current) => {
        const result = checkout(current, customer, expected);
        return { state: result.state, value: result.order };
      }),
    ).rejects.toThrow('another tab');
    const saved = JSON.parse(localStorage.getItem(storageKey)!);
    expect(saved.orders).toHaveLength(1);
    expect(saved.cart).toHaveLength(0);
  });
});
