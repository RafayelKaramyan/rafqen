# Verification scope

## Local verification

The initial implementation passed TypeScript strict checking, ESLint with no warnings, Prettier checks, 21 unit tests, and a production build.

The unit tests cover validated configuration links, key-layout bounds/counts, variant identity, quantity limits and delta updates, discount/shipping arithmetic, saved builds, state validation, order snapshots, checkout revision/generation conflicts, malformed storage preservation, failed storage writes, and duplicate submission rejection.

## Browser verification

Browser execution and public-site verification are in progress for the first release.

The repository includes ten browser scenarios in three profiles: desktop Chromium, desktop Firefox, and Pixel 7 emulation in Chromium. They exercise configuration links, saved builds, bag persistence, search/filter/sort/compare, the complete demo checkout, cross-tab changes, explicit re-review after a checkout change, corrupt-storage recovery, reduced motion and keyboard interactions, route recovery, and optional 3D fallback.

Representative states are scanned with axe-core against WCAG 2 A/AA and WCAG 2.1 A/AA rules. Screenshots and Playwright traces are retained as workflow artifacts. A test file or configured workflow is not evidence of a passing run: use the repository's Actions results for the executed result.

## Limits

Mobile browser coverage is emulation, not testing on a physical phone. Firefox and Chromium coverage does not establish Safari coverage. An accessible automated scan does not replace screen-reader review. A graceful WebGL fallback does not prove GPU rendering quality on all hardware. No Lighthouse score, production load result, payment integration, backend, or real inventory system is claimed.
