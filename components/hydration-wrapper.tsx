"use client";

import { useState, useEffect } from "react";

interface HydrationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationWrapper({ children, fallback = null }: HydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
