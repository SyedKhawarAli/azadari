"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHydrated } from "./use-hydrated";

/**
 * Keeps the screen awake during a live recitation. The lock is dropped by the
 * browser whenever the tab is hidden, so it is re-acquired on the way back.
 */
export function useWakeLock() {
  const hydrated = useHydrated();
  const [enabled, setEnabled] = useState(false);
  const sentinel = useRef<WakeLockSentinel | null>(null);

  const supported = hydrated && typeof navigator !== "undefined" && "wakeLock" in navigator;

  const acquire = useCallback(async () => {
    if (!("wakeLock" in navigator)) return false;
    try {
      sentinel.current = await navigator.wakeLock.request("screen");
      return true;
    } catch {
      return false;
    }
  }, []);

  const setLock = useCallback(
    async (next: boolean) => {
      if (next) {
        const acquired = await acquire();
        setEnabled(acquired);
        return acquired;
      }
      await sentinel.current?.release().catch(() => undefined);
      sentinel.current = null;
      setEnabled(false);
      return false;
    },
    [acquire],
  );

  useEffect(() => {
    if (!enabled) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && sentinel.current?.released !== false) {
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [enabled, acquire]);

  useEffect(
    () => () => {
      void sentinel.current?.release().catch(() => undefined);
      sentinel.current = null;
    },
    [],
  );

  return { supported, enabled, setLock };
}
