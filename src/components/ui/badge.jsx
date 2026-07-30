import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * DEMON SLAYER STATUS BADGE COMPONENT (BDG-STAT)
 * Themes: Beast Emerald #10B981, Zenitsu Gold #F59E0B, Rengoku Crimson #E11D48, Muichiro Cyan #00E5FF, Shinobu Violet #C084FC
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-mono font-bold transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]",
  {
    variants: {
      variant: {
        // In Stock / Success (Inosuke Beast Emerald)
        default:
          "border-[#10B981]/40 bg-[#10B981]/15 text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        success:
          "border-[#10B981]/40 bg-[#10B981]/15 text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        
        // Low Stock / Alert Warning (Zenitsu Solar Amber Gold)
        warning:
          "border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        secondary:
          "border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B]",

        // Out of Stock / Void Danger (Rengoku Flame Crimson)
        destructive:
          "border-[#E11D48]/40 bg-[#E11D48]/15 text-[#E11D48] shadow-[0_0_10px_rgba(225,29,72,0.2)]",
        
        // Realtime / Live Stream (Muichiro Mist Cyan)
        cyan:
          "border-[#00E5FF]/40 bg-[#00E5FF]/15 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]",

        // Encrypted / Security Loyalty (Shinobu Wisteria Violet)
        violet:
          "border-[#C084FC]/40 bg-[#C084FC]/15 text-[#C084FC] shadow-[0_0_10px_rgba(192,132,252,0.2)]",

        // Outline Neutral
        outline:
          "border-slate-700/80 bg-[#071322] text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
