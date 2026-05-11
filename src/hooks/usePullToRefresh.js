import { useState, useEffect, useRef } from "react";

export function usePullToRefresh(onRefresh, containerRef) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const THRESHOLD = 72;

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && el.scrollTop === 0) {
        e.preventDefault();
        setPulling(true);
        setPullDistance(Math.min(delta * 0.5, THRESHOLD + 20));
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(0);
        setPulling(false);
        await onRefresh();
        setRefreshing(false);
      } else {
        setPulling(false);
        setPullDistance(0);
      }
      startY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pullDistance, containerRef]);

  return { pulling, pullDistance, refreshing, threshold: THRESHOLD };
}