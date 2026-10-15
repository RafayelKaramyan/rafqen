# RAFQEN

An original keyboard storefront built with React and TypeScript. Configure a keyboard, compare layouts, save a build, and take it through a complete demonstration checkout.

**[Open the live demo](https://rafayelkaramyan.github.io/rafqen/)** · [Verification workflow](https://github.com/RafayelKaramyan/rafqen/actions/workflows/verify.yml)

**Portfolio project by [Rafayel Karamyan](https://github.com/RafayelKaramyan).** The brand, products, specifications, prices, and shipping options are fictional. No payment is collected and no order is fulfilled.

## Explore the experience

- Three keyboard layouts, four case finishes, three keycap sets, and three switch options. Configuration links preserve the exact selection.
- An authored SVG product illustration changes with the build. Optional, lazy-loaded Three.js geometry adds rotation without making WebGL a requirement for shopping.
- Search, layout filters, saved builds, price sorting, and a side-by-side comparison table.
- A persistent shopping bag with distinct variants, quantity limits, a demonstration discount, and delivery calculations in integer cents.
- Validated checkout, review before placing an order, and reloadable order history. Contact and address fields are never written to persistent storage.
- Keyboard-operable dialogs and tabs, visible focus, reduced-motion support, responsive layouts, and explicit recovery for invalid links or unreadable browser storage.

## Run locally

Use Node.js 22.12 or later; CI uses Node.js 24.

```sh
npm ci
npm run dev
```

The development URL is `http://localhost:4173/rafqen/`. Routing uses URL fragments so direct links work on GitHub Pages without a fallback server.

```sh
npm run check       # TypeScript, ESLint, formatting, unit tests
npm run build       # Production bundle
npx playwright install --with-deps chromium firefox
npm run test:e2e    # Production-build browser tests; run build first
```

The `Verify and publish` workflow checks the source, builds it, runs browser scenarios in Chromium, Firefox, and mobile Chromium, and publishes the resulting build to GitHub Pages only after verification succeeds. Browser reports and screenshots are retained as workflow artifacts.

The release passed **21 unit tests and 30 browser scenarios**, including representative axe accessibility scans. [Verified run and scope](docs/validation.md).

## Design and engineering

The visual direction pairs warm paper, graphite, and a copper accent with oversized typography and an original keyboard study. Product illustrations and the exploded assembly are generated from repository-owned SVG and layout data. The optional 3D preview uses procedural geometry; no external product models or photographs are required.

State has deliberately separate responsibilities:

| Concern                                                         | Location                                                         |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Catalog, physical key layout, validated configuration links     | `src/lib/catalog.ts`                                             |
| Cart rules, pricing, saved builds, checkout, order snapshots    | `src/lib/commerce.ts`                                            |
| Versioned persistence, cross-tab coordination, storage recovery | `src/lib/store.ts`                                               |
| UI state and route composition                                  | `src/pages/`, `src/app.tsx`                                      |
| Optional WebGL rendering and SVG baseline                       | `src/components/keyboard-three.tsx`, `keyboard-illustration.tsx` |

See [architecture and tradeoffs](docs/architecture.md), the [review walkthrough](docs/review-guide.md), and [verification scope](docs/validation.md).

## Demo boundaries

This is a static portfolio application, not a production commerce service. Cart, saved builds, and the latest 20 demo orders belong to the current browser. They are not synced between devices. Clearing site data removes them. Product availability and prices have no commercial meaning. Use the sample checkout details; no real personal information is needed.

A real store would require an authoritative catalog, inventory and order API, server-side repricing, payment-provider integration, tax and shipping services, and operational monitoring. Client-side state must never authorize a real charge or fulfillment.

## Dependencies

React, React Router, Zod, Three.js, React Three Fiber/Drei, and Lucide provide application primitives. Manrope and Space Grotesk are self-hosted through Fontsource. See [third-party notices](THIRD_PARTY.md).

Copyright © 2026 Rafayel Karamyan. No license for the project source is granted by this repository; third-party dependencies retain their own licenses.
