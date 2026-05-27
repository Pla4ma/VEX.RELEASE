import "@shopify/flash-list";

declare module "@shopify/flash-list" {
  interface FlashListProps<T> {
    estimatedItemSize?: T extends unknown ? number : never;
  }
}
