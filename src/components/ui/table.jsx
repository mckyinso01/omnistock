import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * DEMON SLAYER DATA TABLE COMPONENTS (TBL-GRID, TBL-HEAD, TBL-ROW, TBL-NUM)
 * Theme: Tanjiro Midnight Blue (Solid Dark Navy #0B1C30 Container, Deep Void #050811 Header)
 */
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0B1C30] shadow-xl">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm text-slate-200", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-[#050811] border-b border-slate-800/80", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 bg-[#071322]", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t border-slate-800 bg-[#050811] font-medium text-slate-300 [&>tr]:last:border-b-0", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-800/60 bg-[#071322] transition-colors duration-200 hover:bg-[#0E1E36] data-[state=selected]:bg-[#0E1E36]",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-4 text-left align-middle text-[11px] font-bold uppercase tracking-wider text-slate-400 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, isNumeric, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 align-middle text-sm text-slate-200 font-medium [&:has([role=checkbox])]:pr-0",
      isNumeric && "font-mono text-cyan-300 font-bold text-right",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs font-mono text-slate-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
