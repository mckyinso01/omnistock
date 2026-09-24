import { useState, useEffect } from "react";
import { Monitor, MonitorOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerDisplay } from "@/hooks/useCustomerDisplay";

/**
 * CustomerDisplayToggle — Button to open/close the customer-facing display.
 * Syncs cart state to the display window via BroadcastChannel.
 */
export default function CustomerDisplayToggle({ cart, total, subtotal, discount }) {
  const { isOpen, openDisplay, closeDisplay, updateCart } = useCustomerDisplay();

  // Sync cart to display whenever it changes
  useEffect(() => {
    if (isOpen) {
      updateCart(cart, total, subtotal, discount);
    }
  }, [cart, total, subtotal, discount, isOpen, updateCart]);

  return (
    <Button
      onClick={isOpen ? closeDisplay : openDisplay}
      variant={isOpen ? "default" : "outline"}
      size="sm"
      className="gap-2"
      title={isOpen ? "Close customer display" : "Open customer-facing display"}
    >
      {isOpen ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
      {isOpen ? "Display On" : "Customer Display"}
    </Button>
  );
}