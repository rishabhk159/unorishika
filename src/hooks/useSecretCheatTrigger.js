import { useRef, useCallback } from 'react';

/**
 * Custom hook for UNO RISHIKA SECRET CHEAT MODE activation:
 * 
 * Method 1: Long Press
 * - Press & hold for 2000ms (mouse or touchscreen) -> triggers cheat popup.
 * - Cancels if released before 2000ms.
 * 
 * Method 2: Triple Click
 * - Click 3 times within 1000ms -> triggers cheat popup.
 * - Resets click counter if 1000ms expires without 3 clicks.
 */
export function useSecretCheatTrigger(onActivate) {
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const clickResetTimerRef = useRef(null);
  const navTimerRef = useRef(null);

  // Method 1: Long Press Start (mouse / touch)
  const handlePressStart = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTriggeredRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      if (onActivate) onActivate();
    }, 2000);
  }, [onActivate]);

  // Method 1: Long Press Cancel
  const handlePressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Method 2: Triple Click Handler
  const handleClick = useCallback(
    (e, onSingleClickNavigate) => {
      // If long press just fired, prevent default navigation and return
      if (longPressTriggeredRef.current) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        longPressTriggeredRef.current = false;
        return;
      }

      const now = Date.now();

      // Check if click arrived within 1 second of previous click
      if (now - lastClickTimeRef.current <= 1000) {
        clickCountRef.current += 1;
      } else {
        clickCountRef.current = 1;
      }
      lastClickTimeRef.current = now;

      // Reset click counter if time limit expires
      if (clickResetTimerRef.current) {
        clearTimeout(clickResetTimerRef.current);
      }
      clickResetTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1000);

      // TRIPLE CLICK REACHED!
      if (clickCountRef.current >= 3) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        clickCountRef.current = 0;
        if (navTimerRef.current) {
          clearTimeout(navTimerRef.current);
          navTimerRef.current = null;
        }
        if (onActivate) onActivate();
        return;
      }

      // If attached to a navigation link, delay navigation slightly so user can complete triple-click
      if (onSingleClickNavigate) {
        e?.preventDefault?.();
        if (navTimerRef.current) {
          clearTimeout(navTimerRef.current);
        }
        navTimerRef.current = setTimeout(() => {
          if (clickCountRef.current < 3 && !longPressTriggeredRef.current) {
            onSingleClickNavigate();
          }
        }, 320);
      }
    },
    [onActivate]
  );

  return {
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressEnd,
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressEnd,
    handleClick,
  };
}
