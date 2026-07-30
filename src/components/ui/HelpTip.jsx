import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Small info icon with a hover tooltip — place beside buttons/labels that benefit from a hint.
export default function HelpTip({ children, label, side = "top" }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="button"
            aria-label={label || "Help"}
            className="inline-flex items-center text-slate-400 hover:text-slate-300 transition-colors cursor-help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[240px] text-xs leading-relaxed font-normal">
          {children || label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}