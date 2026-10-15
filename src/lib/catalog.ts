import { z } from 'zod';

export const modelIds = ['s65', 's75', 's98'] as const;
export const finishIds = ['chalk', 'ink', 'moss', 'copper'] as const;
export const capIds = ['tonal', 'contrast', 'signal'] as const;
export const switchIds = ['linear', 'tactile', 'silent'] as const;
export type ModelId = (typeof modelIds)[number];
export type FinishId = (typeof finishIds)[number];
export type CapId = (typeof capIds)[number];
export type SwitchId = (typeof switchIds)[number];
export const configSchema = z
  .object({
    model: z.enum(modelIds),
    finish: z.enum(finishIds),
    caps: z.enum(capIds),
    switches: z.enum(switchIds),
  })
  .strict();
export type Configuration = z.infer<typeof configSchema>;
export type Product = {
  id: ModelId;
  name: string;
  format: string;
  keys: number;
  price: number;
  title: string;
  description: string;
  width: number;
  depth: number;
  weight: string;
  badge: string;
};
export const products: readonly Product[] = [
  {
    id: 's65',
    name: 'Studio 65',
    format: '65%',
    keys: 68,
    price: 18900,
    title: 'Less desk. More room.',
    description: 'A compact footprint with dedicated arrows. Space for everything that matters.',
    width: 312,
    depth: 112,
    weight: '1.1 kg',
    badge: 'THE COMPACT ONE',
  },
  {
    id: 's75',
    name: 'Studio 75',
    format: '75%',
    keys: 83,
    price: 22900,
    title: 'The everyday original.',
    description: 'The function row you reach for. The space you need. A considered middle ground.',
    width: 332,
    depth: 139,
    weight: '1.4 kg',
    badge: 'THE STUDIO STANDARD',
  },
  {
    id: 's98',
    name: 'Studio 98',
    format: '98%',
    keys: 99,
    price: 26900,
    title: 'A place for every key.',
    description: 'A number pad, a full function row and a surprisingly considered footprint.',
    width: 391,
    depth: 139,
    weight: '1.7 kg',
    badge: 'THE FULL PICTURE',
  },
];
export const finishes: Record<
  FinishId,
  { name: string; hex: string; price: number; text: string }
> = {
  chalk: { name: 'Chalk', hex: '#d9d4c9', price: 0, text: 'Warm, quiet and easy to live with.' },
  ink: { name: 'Ink', hex: '#333a40', price: 0, text: 'A deep graphite with a soft satin finish.' },
  moss: { name: 'Moss', hex: '#68705e', price: 1500, text: 'A little of the outside, brought in.' },
  copper: {
    name: 'Copper',
    hex: '#b57657',
    price: 2500,
    text: 'A warm metallic tone with its own character.',
  },
};
export const capSets: Record<
  CapId,
  { name: string; main: string; mods: string; accent: string; price: number; text: string }
> = {
  tonal: {
    name: 'Tonal',
    main: '#e8e3d9',
    mods: '#c5c0b5',
    accent: '#b84b30',
    price: 0,
    text: 'Warm neutrals. One deliberate accent.',
  },
  contrast: {
    name: 'Contrast',
    main: '#333a40',
    mods: '#d6d1c6',
    accent: '#bd5535',
    price: 1000,
    text: 'Graphite alphas. Light modifiers. Clear separation.',
  },
  signal: {
    name: 'Signal',
    main: '#e6ded1',
    mods: '#717c86',
    accent: '#ba4d2d',
    price: 1500,
    text: 'Blue-grey modifiers with a burnt-orange accent.',
  },
};
export const switches: Record<
  SwitchId,
  { name: string; force: string; price: number; text: string }
> = {
  linear: {
    name: 'Linear',
    force: '45 g',
    price: 0,
    text: 'A smooth, uninterrupted press from top to bottom.',
  },
  tactile: {
    name: 'Tactile',
    force: '55 g',
    price: 1500,
    text: 'A gentle bump that lets you feel each actuation.',
  },
  silent: {
    name: 'Silent',
    force: '45 g',
    price: 2500,
    text: 'A cushioned press for shared rooms and late ideas.',
  },
};
export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
export function defaultConfig(model: ModelId = 's75'): Configuration {
  return { model, finish: 'chalk', caps: 'tonal', switches: 'linear' };
}
export function unitPrice(config: Configuration): number {
  return (
    getProduct(config.model)!.price +
    finishes[config.finish].price +
    capSets[config.caps].price +
    switches[config.switches].price
  );
}
export function configId(config: Configuration): string {
  return `${config.model}.${config.finish}.${config.caps}.${config.switches}`;
}
export function configFromSearch(model: ModelId, params: URLSearchParams): Configuration {
  const result = configSchema.safeParse({
    model,
    finish: params.get('finish') ?? 'chalk',
    caps: params.get('caps') ?? 'tonal',
    switches: params.get('switches') ?? 'linear',
  });
  return result.success ? result.data : defaultConfig(model);
}
export function configSearch(config: Configuration): string {
  return new URLSearchParams({
    finish: config.finish,
    caps: config.caps,
    switches: config.switches,
  }).toString();
}
export function money(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export type Key = {
  x: number;
  y: number;
  w: number;
  label: string;
  kind: 'main' | 'mod' | 'accent';
};
export function keyboardLayout(model: ModelId): { keys: Key[]; width: number; height: number } {
  const hasFn = model !== 's65';
  const rows: { labels: string[]; widths?: number[] }[] = [
    ...(hasFn
      ? [
          {
            labels: [
              'esc',
              'F1',
              'F2',
              'F3',
              'F4',
              'F5',
              'F6',
              'F7',
              'F8',
              'F9',
              'F10',
              'F11',
              'F12',
              'del',
            ],
          },
        ]
      : []),
    {
      labels: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '=', '⌫'],
      widths: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    },
    {
      labels: ['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      widths: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    },
    {
      labels: ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'enter'],
      widths: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    },
    {
      labels: ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'shift', '↑'],
      widths: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1],
    },
    {
      labels: ['ctrl', 'opt', 'cmd', 'space', 'cmd', 'fn', '←', '↓', '→'],
      widths: [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1],
    },
  ];
  const keys: Key[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    row.labels.forEach((label, i) => {
      const w = row.widths?.[i] ?? 1;
      keys.push({
        x,
        y,
        w,
        label: label === 'space' ? '' : label,
        kind: ['esc', 'enter'].includes(label)
          ? 'accent'
          : label.length > 1 || ['↑', '←', '↓', '→', '⌫'].includes(label)
            ? 'mod'
            : 'main',
      });
      x += w;
    });
  });
  if (model !== 's98') {
    ['home', 'pgup', 'pgdn', 'end', 'del', ...(hasFn ? ['ins'] : [])].forEach((label, y) =>
      keys.push({ x: 15.3, y, w: 1, label, kind: 'mod' }),
    );
  }
  if (model === 's98') {
    const num = [
      ['num', '/', '*', '−'],
      ['7', '8', '9', '+'],
      ['4', '5', '6', '+'],
      ['1', '2', '3', '↵'],
      ['0', '0', '.', '↵'],
    ];
    num.forEach((row, r) =>
      row.forEach((label, c) =>
        keys.push({ x: 15.4 + c, y: r + 1, w: 1, label, kind: label === '↵' ? 'accent' : 'main' }),
      ),
    );
    ['print', 'pause'].forEach((label, c) =>
      keys.push({ x: 15.4 + c, y: 0, w: 1, label, kind: 'mod' }),
    );
  }
  return { keys, width: model === 's98' ? 19.7 : 16.8, height: rows.length + 0.7 };
}
