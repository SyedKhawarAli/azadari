"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * Reader preferences are restored from localStorage, which the server cannot
 * know about. Components that read them wait for this flag before applying the
 * stored value so that the first client render still matches the server HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
