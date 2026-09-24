import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useCustomerDisplay — Manages a customer-facing second screen via BroadcastChannel.
 * Opens a popup window to /customer-display and syncs cart state in real-time.
 */
export function useCustomerDisplay() {
  const [isOpen, setIsOpen] = useState(false);
  const channelRef = useRef(null);
  const displayWindowRef = useRef(null);

  useEffect(() => {
    const channel = new BroadcastChannel("omnistock-customer-display");
    channelRef.current = channel;

    // Listen for window close
    channel.onmessage = (event) => {
      if (event.data?.type === "display-ready") {
        setIsOpen(true);
      }
      if (event.data?.type === "display-closed") {
        setIsOpen(false);
      }
    };

    const checkInterval = setInterval(() => {
      if (displayWindowRef.current && displayWindowRef.current.closed) {
        setIsOpen(false);
        displayWindowRef.current = null;
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
      channel.close();
    };
  }, []);

  const openDisplay = useCallback(() => {
    const w = window.open(
      "/customer-display",
      "omnistock-customer-display",
      "width=480,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
    displayWindowRef.current = w;
  }, []);

  const closeDisplay = useCallback(() => {
    if (displayWindowRef.current && !displayWindowRef.current.closed) {
      displayWindowRef.current.close();
    }
    displayWindowRef.current = null;
    setIsOpen(false);
  }, []);

  const updateCart = useCallback((cart, total, subtotal, discount) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "cart-update",
        cart,
        total,
        subtotal,
        discount,
        timestamp: Date.now(),
      });
    }
  }, []);

  const showThankYou = useCallback((total) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "thank-you",
        total,
        timestamp: Date.now(),
      });
    }
  }, []);

  return { isOpen, openDisplay, closeDisplay, updateCart, showThankYou };
}