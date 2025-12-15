'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if code is running on client side
 * Useful for avoiding hydration mismatches
 *
 * @example
 * const isMounted = useMounted();
 * if (!isMounted) return null; // or loading state
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
