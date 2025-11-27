"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect mobile devices for 3D fallback.
 * Returns true for touch devices or screens narrower than 768px.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      
      // Check for small screen
      const isSmallScreen = window.innerWidth < 768;
      
      // Check for mobile user agent (backup)
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      setIsMobile(hasTouch || isSmallScreen || mobileUserAgent);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export default useIsMobile;


