import { useEffect, useState } from "react";

export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const isClient = useClientOnly();

  useEffect(() => {
    if (!isClient) return;

    function updateSize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, [isClient]);

  return windowSize;
}

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const isClient = useClientOnly();

  useEffect(() => {
    if (!isClient) return;

    function checkIsMobile() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [isClient, breakpoint]);

  return isMobile;
}
