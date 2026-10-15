import { z } from 'zod';
import { configId, configSchema, unitPrice, type Configuration } from './catalog';

export const MAX_QUANTITY = 5;
export const cartLineSchema = z
  .object({ config: configSchema, quantity: z.number().int().min(1).max(MAX_QUANTITY) })
  .strict();
export type CartLine = z.infer<typeof cartLineSchema>;
export const deliverySchema = z.enum(['standard', 'express']);
export type Delivery = z.infer<typeof deliverySchema>;
export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Enter a full name.').max(100),
  email: z.email('Enter a valid email address.').max(254),
  address: z.string().trim().min(4, 'Enter a street address.').max(150),
  city: z.string().trim().min(2, 'Enter a city.').max(80),
  postalCode: z.string().trim().min(2, 'Enter a postal code.').max(15),
  country: z.enum(['Armenia', 'United States', 'United Kingdom', 'Germany', 'France']),
});
export type Customer = z.infer<typeof customerSchema>;
export const orderSchema = z
  .object({
    id: z.uuid(),
    createdAt: z.iso.datetime(),
    lines: z
      .array(cartLineSchema.extend({ unitPrice: z.number().int().positive() }))
      .min(1)
      .max(30),
    subtotal: z.number().int().nonnegative(),
    discount: z.number().int().nonnegative(),
    shipping: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    delivery: deliverySchema,
  })
  .superRefine((order, ctx) => {
    const subtotal = order.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    if (
      subtotal !== order.subtotal ||
      order.discount > subtotal ||
      order.total !== subtotal - order.discount + order.shipping
    )
      ctx.addIssue({ code: 'custom', message: 'Order totals do not match the saved lines.' });
  });
export type Order = z.infer<typeof orderSchema>;
export const stateSchema = z
  .object({
    version: z.literal(1),
    generation: z.uuid(),
    revision: z.number().int().nonnegative(),
    cart: z.array(cartLineSchema).max(30),
    saved: z.array(configSchema).max(30),
    coupon: z.enum(['STUDIO10']).nullable(),
    delivery: deliverySchema,
    orders: z.array(orderSchema).max(20),
  })
  .strict()
  .superRefine((state, ctx) => {
    for (const [key, values] of [
      ['cart', state.cart.map((l) => configId(l.config))],
      ['saved', state.saved.map(configId)],
    ] as const) {
      if (new Set(values).size !== values.length)
        ctx.addIssue({ code: 'custom', path: [key], message: 'Duplicate configurations.' });
    }
  });
export type ShopState = z.infer<typeof stateSchema>;
export function freshState(): ShopState {
  return {
    version: 1,
    generation: crypto.randomUUID(),
    revision: 0,
    cart: [],
    saved: [],
    coupon: null,
    delivery: 'standard',
    orders: [],
  };
}
export function cartTotals(state: Pick<ShopState, 'cart' | 'coupon' | 'delivery'>) {
  const subtotal = state.cart.reduce(
    (sum, line) => sum + unitPrice(line.config) * line.quantity,
    0,
  );
  const discount = state.coupon === 'STUDIO10' ? Math.round(subtotal / 10) : 0;
  const shipping = !subtotal
    ? 0
    : state.delivery === 'express'
      ? 1900
      : subtotal - discount >= 25000
        ? 0
        : 900;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
export function addLine(state: ShopState, config: Configuration): ShopState {
  configSchema.parse(config);
  const id = configId(config),
    existing = state.cart.find((l) => configId(l.config) === id);
  if (existing && existing.quantity >= MAX_QUANTITY)
    throw new Error('You can add up to 5 of each configuration.');
  if (!existing && state.cart.length >= 30)
    throw new Error('Your bag can hold 30 different configurations.');
  return {
    ...state,
    cart: existing
      ? state.cart.map((l) => (configId(l.config) === id ? { ...l, quantity: l.quantity + 1 } : l))
      : [...state.cart, { config: { ...config }, quantity: 1 }],
  };
}
export function setQuantity(state: ShopState, id: string, quantity: number): ShopState {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY)
    throw new Error('Choose a quantity between 0 and 5.');
  return {
    ...state,
    cart: state.cart.flatMap((line) =>
      configId(line.config) === id ? (quantity ? [{ ...line, quantity }] : []) : [line],
    ),
  };
}
export function adjustQuantity(state: ShopState, id: string, delta: -1 | 1): ShopState {
  const line = state.cart.find((item) => configId(item.config) === id);
  if (!line) throw new Error('This item changed in another tab. Review your updated bag.');
  return setQuantity(state, id, line.quantity + delta);
}
export function toggleSaved(state: ShopState, config: Configuration): ShopState {
  const id = configId(config),
    exists = state.saved.some((item) => configId(item) === id);
  if (!exists && state.saved.length >= 30) throw new Error('You can save up to 30 configurations.');
  return {
    ...state,
    saved: exists
      ? state.saved.filter((item) => configId(item) !== id)
      : [...state.saved, { ...config }],
  };
}
export function checkout(
  state: ShopState,
  customer: unknown,
  expected: Pick<ShopState, 'revision' | 'generation'>,
): { state: ShopState; order: Order } {
  customerSchema.parse(customer);
  if (state.revision !== expected.revision || state.generation !== expected.generation)
    throw new Error('Your bag changed in another tab. Review the updated order and try again.');
  if (!state.cart.length) throw new Error('Your bag is empty. Add a keyboard before checking out.');
  const order: Order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lines: state.cart.map((line) => ({
      config: { ...line.config },
      quantity: line.quantity,
      unitPrice: unitPrice(line.config),
    })),
    ...cartTotals(state),
    delivery: state.delivery,
  };
  return {
    order,
    state: { ...state, cart: [], coupon: null, orders: [order, ...state.orders].slice(0, 20) },
  };
}
