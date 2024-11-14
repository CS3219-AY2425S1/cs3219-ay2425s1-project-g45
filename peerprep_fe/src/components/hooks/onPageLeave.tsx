import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useBeforeUnload(callback: () => void) {
  useEffect(() => {
    window.addEventListener("beforeunload", callback);
    return () => {
      window.removeEventListener("beforeunload", callback);
    };
  }, [callback]);
}

export function usePageLeave(callback: () => void) {
  const pathname = usePathname();

  useEffect(() => {
    callback();
  }, [pathname]);
}

export function useHistoryChange(callback: () => void) {
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(() => {
        callback();
      }, 100);
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);

      setTimeout(() => {
        callback();
      }, 100);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [callback]);
}

export function useOnPageLeave(callback: () => void) {
  usePageLeave(callback);
  useBeforeUnload(callback);
  useHistoryChange(callback);
}
