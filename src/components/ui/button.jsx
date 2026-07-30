import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * CRITERIA-BASED DEMON SLAYER BUTTON VARIANTS:
 * 1. glowing (BTN-GLOW): Highest Priority / Core Value & Revenue Actions (Kinetic Glowing Border)
 * 2. default (BTN-PRI): Primary Action / Form Submissions & Confirmations (Tanjiro Electric Blue)
 * 3. outline (BTN-SEC): Secondary Action / Cancel, Filters, Exports (Dark Navy + Cyan Hover)
 * 4. destructive (BTN-DANGER): Destructive / Void, Delete, Purge (Rengoku Flame Crimson)
 * 5. ghost (BTN-GHOST): Inline Micro Actions / Close, Pagination, Menus
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5FF] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-95",
  {
    variants: {
      variant: {
        // BTN-PRI: Standard Primary Action (Add Item, Save, Complete Sale)
        default:
          "bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-[#1D4ED8] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]",
        
        // BTN-GLOW: Highest Priority Company/Establishment Action (Launch App, Complete Fast Sale)
        glowing:
          "moving-border-btn bg-[#2563EB] text-white font-bold tracking-wide shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.7)]",
        
        // BTN-DANGER: Destructive Action (Void Sale, Delete Product, Purge DB)
        destructive:
          "bg-[#E11D48] text-white font-semibold shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:bg-[#BE123C] hover:shadow-[0_0_20px_rgba(225,29,72,0.6)]",
        
        // BTN-SEC: Secondary Action (Cancel, Clear, Filter, Export)
        outline:
          "bg-[#071322] border border-slate-700/80 text-slate-200 hover:border-[#00E5FF]/60 hover:text-white hover:bg-[#0E1E36] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]",
        
        // BTN-SEC Alias
        secondary:
          "bg-[#071322] border border-slate-700/80 text-slate-200 hover:border-[#00E5FF]/60 hover:text-white hover:bg-[#0E1E36]",
        
        // BTN-GHOST: Micro Inline Actions (Close, More Options, Pagination)
        ghost:
          "text-slate-300 hover:text-cyan-300 hover:bg-[#071322]",
        
        // Link
        link:
          "text-[#00E5FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
