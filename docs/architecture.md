# Architecture and tradeoffs

## Product state is a validated contract

A configuration contains only four identifiers: model, finish, caps, and switches. Zod validates both URL parameters and persisted state. Prices are calculated from catalog entries, never accepted from query parameters. The configuration identifier is also the cart identity: two identical builds merge, while a different switch remains a separate line.

Money stays in integer cents through discount rounding, shipping thresholds, and totals. The shipping threshold is evaluated after the discount. Quantity changes apply a delta to the latest persisted state, so an open tab cannot silently overwrite a newer quantity with an old absolute value.

Router transitions are disabled for this small static application: native radios and filters write directly to the configuration URL and must commit synchronously with the input event. Deferring those navigations can restore an old controlled radio value or let a fast follow-up filter read stale query parameters. The optional 3D view has its own Suspense boundary.

## Persistence and checkout

`useSyncExternalStore` connects React to a small external store. Each mutation reads the current storage value, applies a pure domain operation, validates the result, and persists before notifying subscribers or reporting success. Storage exceptions are shown to the visitor; a failed write does not produce a successful checkout.

When available, the Web Locks API serializes writes between tabs. A storage event refreshes other tabs. The fallback still reads the latest state and works within a tab, but cannot guarantee atomic writes across simultaneous tabs without Web Locks. Browser storage is a demo persistence boundary, not a database or security boundary.

Checkout captures a generation identifier and revision at review time. If the bag changes or data is reset, placing that stale review is rejected. A completed order snapshots unit prices and totals, clears the bag, and retains at most 20 orders in the same transaction. Contact and address fields exist only in component memory and are not copied into the order record. The order is a local demonstration receipt.

Malformed persisted data is left intact. The interface explains the problem and offers an explicit reset, rather than silently destroying a visitor's saved builds. Schema version changes require a migration or a similarly explicit recovery path.

## Rendering and motion

SVG is the default product rendering path. A shared physical layout supplies both SVG key positions and the procedural 3D model. The 3D module is loaded only after the visitor chooses it. A rendering error falls back to the illustration without blocking configuration or checkout.

The canvas renders on demand, caps use instanced meshes, and geometry/material/texture resources are disposed on replacement or unmount. Pixel ratio is capped. Touch devices retain vertical page scrolling and have explicit rotation controls. Reduced-motion preferences remove decorative transitions and reveal delays.

The tradeoff is a relatively large optional 3D chunk. It is absent from the initial shopping interaction, but still requires a separate download when requested. No performance score is implied by using lazy loading; measure the deployed build on the target hardware before setting a performance budget.

## Accessible interaction

Navigation uses real links. Choice groups use native radios. The exploded assembly uses a tablist with arrow, Home, and End support. Dialogs use the native modal dialog element, provide a name and close button, support Escape, and restore focus to the opener. Form errors are associated with fields and the first invalid input receives focus.

Automated accessibility checks cover representative states, but cannot establish full accessibility conformance. Screen-reader testing and a broader device/browser matrix remain valuable manual work.

## Deployment boundary

Vite builds static assets under `/rafqen/`. Hash routing makes nested routes reloadable on GitHub Pages. A single workflow verifies, builds, and tests the production bundle before deploying that same bundle. Deployment requires Pages to use GitHub Actions as its source. No runtime server or paid hosting account is required.
