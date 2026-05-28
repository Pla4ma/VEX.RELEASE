import { http, HttpResponse, delay } from "msw";

export const databaseHandlers = [
  http.get("*/rest/v1/wallets", async ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id")?.split(".")[1];
    if (!userId) {
      return HttpResponse.json([], { status: 200 });
    }
    await delay(50);
    return HttpResponse.json([
      {
        id: "wallet-1",
        user_id: userId,
        coins: 1000,
        gems: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }),
  http.patch("*/rest/v1/wallets", async ({ request }) => {
    const body = (await request.json()) as { coins?: number; gems?: number };
    await delay(50);
    return HttpResponse.json([
      { id: "wallet-1", ...body, updated_at: new Date().toISOString() },
    ]);
  }),
  http.get("*/rest/v1/inventory_items", async () => {
    await delay(50);
    return HttpResponse.json([
      {
        id: "inv-1",
        user_id: "user-123",
        item_definition_id: "item-1",
        quantity: 5,
        created_at: new Date().toISOString(),
      },
      {
        id: "inv-2",
        user_id: "user-123",
        item_definition_id: "item-2",
        quantity: 1,
        durability: 100,
        created_at: new Date().toISOString(),
      },
    ]);
  }),
  http.get("*/rest/v1/item_definitions", async () => {
    await delay(50);
    return HttpResponse.json([
      {
        id: "item-1",
        name: "Health Potion",
        description: "Restores health",
        type: "CONSUMABLE",
        rarity: "COMMON",
        icon: "potion-red",
        max_stack: 99,
        tradable: true,
      },
      {
        id: "item-2",
        name: "Iron Sword",
        description: "A sturdy sword",
        type: "EQUIPMENT",
        rarity: "UNCOMMON",
        icon: "sword-iron",
        max_stack: 1,
        durability: 100,
        tradable: true,
      },
    ]);
  }),
  http.get("*/rest/v1/wallet_transactions", async () => {
    await delay(50);
    return HttpResponse.json([
      {
        id: "tx-1",
        user_id: "user-123",
        type: "EARN",
        currency: "COINS",
        amount: 100,
        balance_before: 900,
        balance_after: 1000,
        source: "SESSION",
        description: "Session reward",
        created_at: new Date().toISOString(),
      },
    ]);
  }),
  http.post("*/rest/v1/wallet_transactions", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    await delay(50);
    return HttpResponse.json([
      { id: "tx-new", ...body, created_at: new Date().toISOString() },
    ]);
  }),
];
