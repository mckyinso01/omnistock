import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * DEMON SLAYER INPUT COMPONENT (INP-TEXT & INP-NUM)
 * Theme: Tanjiro Midnight Blue & Muichiro Mist Cyan Focus
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const isNumber = type === "number";
  
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-800 bg-[#071322] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:border-[#00E5FF] focus-visible:ring-1 focus-visible:ring-[#00E5FF] disabled:cursor-not-allowed disabled:opacity-50",
        isNumber && "font-mono text-[#00E5FF] font-bold text-right",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input"

export { Input }
