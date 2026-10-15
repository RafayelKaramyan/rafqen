# Review walkthrough

Use this sequence to inspect the project and discuss its choices in an interview. It is a guide to the actual implementation, not a script for claiming experience with systems that are not present.

1. Start on the home page. Change the case finish, then open the configurator. The chosen finish should carry through the URL and the price.
2. Configure Studio 75 with Copper, Signal caps, and Silent switches. The product price is $294. Save the exact build, copy its link, and reload it.
3. Add the same build twice. It becomes one bag line with quantity two. Change the switches and add again to see a separate variant.
4. Apply `STUDIO10`. Explain why the discount is rounded in cents and why standard shipping is evaluated against the discounted subtotal.
5. Use sample details, review the order, and place it. Reload the receipt. Inspect browser storage to confirm that the receipt contains product snapshots but no contact details or address.
6. Open a second tab and change the bag. Explain Web Locks, storage events, and what can race when Web Locks is unavailable. A stale checkout review must be rejected.
7. Use only the keyboard to navigate, compare formats, close a dialog with Escape, and change the assembly tabs. Enable reduced motion and repeat the home-page navigation.
8. Read the tests and workflow output. Distinguish verified behavior from the production services this demo intentionally does not implement.

Useful code paths to understand and change:

- Add a finish: update the validated catalog values and presentation data, then verify URL round trips, pricing, and rendering.
- Change a shipping rule: edit the domain function and add a boundary assertion around the threshold.
- Add real checkout: keep the UI contract but move pricing, inventory, order creation, and payment authorization to a server. A browser receipt is not proof of payment.
- Version persistence: decide which old values can be migrated and how an unsuccessful migration preserves recoverable user data.
- Evaluate a design tradeoff: compare the SVG baseline with optional 3D on a low-power device, including bundle transfer, frame responsiveness, and touch behavior.
