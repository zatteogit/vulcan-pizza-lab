import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(touchLandscape = false) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const narrow = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const mql = window.matchMedia(touchLandscape
      ? `${narrow}, (pointer: coarse) and (max-width: 1023px) and (max-height: 500px)`
      : narrow);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [touchLandscape]);

  return !!isMobile;
}
