"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const clientMounted = () => true;
const serverUnmounted = () => false;

/**
 * True only after hydration. Uses useSyncExternalStore so the value flips
 * post-hydration without a synchronous setState inside an effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, clientMounted, serverUnmounted);
}
