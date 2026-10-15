import { describe, expect, it } from 'vitest';
import {
  configFromSearch,
  configId,
  configSchema,
  configSearch,
  defaultConfig,
  finishes,
  keyboardLayout,
  money,
  products,
  unitPrice,
} from './catalog';
import {
  addLine,
  adjustQuantity,
  cartTotals,
  checkout,
  freshState,
  orderSchema,
  setQuantity,
  stateSchema,
  toggleSaved,
} from './commerce';

const customer = {
  name: 'Demo Customer',
  email: 'demo@example.test',
  address: '12 Example Street',
  city: 'Yerevan',
  postalCode: '0001',
  country: 'Armenia',
};
describe('configuration contracts', () => {
  it('round-trips every finish and rejects injected prices', () => {
    for (const finish of Object.keys(finishes) as (keyof typeof finishes)[]) {
      const config = { ...defaultConfig(), finish };
      expect(configFromSearch(config.model, new URLSearchParams(configSearch(config)))).toEqual(
        config,
      );
    }
    expect(configSchema.safeParse({ ...defaultConfig(), price: 1 }).success).toBe(false);
  });
  it('recovers an invalid shared option to a complete valid build', () => {
    expect(configFromSearch('s75', new URLSearchParams('finish=unavailable&caps=signal'))).toEqual(
      defaultConfig(),
    );
  });
  it('prices a fully customized build using integer cents', () => {
    expect(
      unitPrice({ ...defaultConfig(), finish: 'copper', caps: 'signal', switches: 'silent' }),
    ).toBe(29400);
    expect(money(29400)).toBe('$294');
    expect(money(26361)).toBe('$263.61');
  });
  it.each(products)('renders the advertised key count for $name', (product) => {
    const layout = keyboardLayout(product.id);
    expect(layout.keys).toHaveLength(product.keys);
    expect(
      layout.keys.every((key) => key.x + key.w <= layout.width && key.y + 1 <= layout.height),
    ).toBe(true);
  });
});
describe('bag transactions and totals', () => {
  it('merges the same configuration while keeping different switches separate', () => {
    const config = defaultConfig();
    let state = addLine(freshState(), config);
    state = addLine(state, { ...config });
    state = addLine(state, { ...config, switches: 'tactile' });
    expect(state.cart).toHaveLength(2);
    expect(state.cart[0]?.quantity).toBe(2);
    expect(cartTotals(state).subtotal).toBe(70200);
  });
  it('enforces quantity limits without changing the previous snapshot', () => {
    const config = defaultConfig();
    let state = addLine(freshState(), config);
    state = setQuantity(state, configId(config), 5);
    expect(() => addLine(state, config)).toThrow('up to 5');
    expect(() => setQuantity(state, configId(config), 1.5)).toThrow();
    expect(state.cart[0]?.quantity).toBe(5);
    expect(setQuantity(state, configId(config), 0).cart).toHaveLength(0);
  });
  it('adjusts the latest quantity and refuses to restore an item removed elsewhere', () => {
    const config = defaultConfig(),
      id = configId(config);
    const state = setQuantity(addLine(freshState(), config), id, 3);
    expect(adjustQuantity(state, id, 1).cart[0]?.quantity).toBe(4);
    expect(() => adjustQuantity(freshState(), id, 1)).toThrow('another tab');
  });
  it('applies a discount before the included-delivery threshold', () => {
    const state = addLine(freshState(), { ...defaultConfig(), finish: 'copper' });
    expect(cartTotals(state)).toEqual({ subtotal: 25400, discount: 0, shipping: 0, total: 25400 });
    expect(cartTotals({ ...state, coupon: 'STUDIO10' })).toEqual({
      subtotal: 25400,
      discount: 2540,
      shipping: 900,
      total: 23760,
    });
    expect(cartTotals({ ...state, coupon: 'STUDIO10', delivery: 'express' }).total).toBe(24760);
  });
  it('keeps an empty bag at zero regardless of delivery preference', () => {
    expect(cartTotals({ ...freshState(), delivery: 'express', coupon: 'STUDIO10' })).toEqual({
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    });
  });
  it('saves and unsaves exact configurations without changing the bag', () => {
    const config = defaultConfig(),
      state = toggleSaved(freshState(), config);
    expect(state.saved).toEqual([config]);
    expect(state.cart).toHaveLength(0);
    expect(toggleSaved(state, config).saved).toHaveLength(0);
  });
  it('rejects duplicate lines and unrecognized state versions', () => {
    const config = defaultConfig(),
      state = addLine(freshState(), config);
    expect(stateSchema.safeParse({ ...state, cart: [state.cart[0], state.cart[0]] }).success).toBe(
      false,
    );
    expect(stateSchema.safeParse({ ...state, version: 2 }).success).toBe(false);
  });
});
describe('demo checkout', () => {
  it('creates a price snapshot and clears the bag without saving personal fields', () => {
    const state = { ...addLine(freshState(), defaultConfig()), coupon: 'STUDIO10' as const };
    const result = checkout(state, customer, state);
    expect(result.order.total).toBe(21510);
    expect(result.order.lines[0]?.unitPrice).toBe(22900);
    expect(result.state.cart).toEqual([]);
    expect(result.state.coupon).toBeNull();
    expect(result.state.orders[0]).toEqual(result.order);
    expect(JSON.stringify(result.order)).not.toContain(customer.email);
    expect(JSON.stringify(result.state)).not.toContain(customer.address);
    expect(state.cart).toHaveLength(1);
    result.state.cart = addLine(result.state, { ...defaultConfig(), finish: 'moss' }).cart;
    expect(result.order.lines[0]?.config.finish).toBe('chalk');
  });
  it('rejects an empty bag and invalid details', () => {
    const state = freshState();
    expect(() => checkout(state, customer, state)).toThrow('empty');
    expect(() =>
      checkout(addLine(state, defaultConfig()), { ...customer, email: 'wrong' }, state),
    ).toThrow();
  });
  it('detects a stale checkout and a reset even when revisions happen to match', () => {
    const state = addLine(freshState(), defaultConfig());
    expect(() => checkout({ ...state, revision: 1 }, customer, state)).toThrow('another tab');
    const reset = addLine(freshState(), defaultConfig());
    expect(reset.revision).toBe(state.revision);
    expect(() => checkout(reset, customer, state)).toThrow('another tab');
  });
  it('validates historical arithmetic independently of the live catalog', () => {
    const state = addLine(freshState(), defaultConfig()),
      order = checkout(state, customer, state).order;
    expect(orderSchema.safeParse(order).success).toBe(true);
    expect(orderSchema.safeParse({ ...order, total: order.total - 1 }).success).toBe(false);
  });
});
