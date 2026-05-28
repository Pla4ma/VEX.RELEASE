/**
 * Risk 3 — Boss HUD Display Policy Consumption
 * Risk 4 — Route Registration Enforcement
 * Risk 5 — Privacy Inventory ↔ App Manifest
 *
 * Split into individual risk test files:
 *   - risk-boss-route-privacy-boss.test.ts   (Risk 3)
 *   - risk-boss-route-privacy-route.test.ts   (Risk 4)
 *   - risk-boss-route-privacy-privacy.test.ts (Risk 5)
 */

// All tests live in the split files above.
// This barrel file ensures the test runner discovers them if imported directly.
import "./risk-boss-route-privacy-boss.test";
import "./risk-boss-route-privacy-route.test";
import "./risk-boss-route-privacy-privacy.test";
