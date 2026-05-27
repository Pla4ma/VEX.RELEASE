/**
 * MSW Server Setup
 *
 * Configures Mock Service Worker for API testing
 * Provides request interception for Supabase and other APIs
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Create MSW server with all handlers
export const server = setupServer(...handlers);
