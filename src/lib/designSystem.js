/**
 * OmniStock Teal Matrix Design Tokens
 * Light teal-tinted theme for the full application
 */

export const DEMON_SLAYER_THEMES = {
  tealMatrix: {
    name: "Teal Matrix",
    primary: "#146f5b",
    accent: "#16785f",
    surface: "#f6fbf9",
    surfaceCard: "#ffffff",
    fontHeader: "Inter",
    fontData: "Inter",
  },
};

export const DESIGN_TOKENS = {
  surfaces: {
    deep: '#f6fbf9',
    card: '#ffffff',
    cardHover: '#f4f8f6',
    glass: 'rgba(255,255,255,0.86)',
    modal: '#ffffff',
    tableRow: '#ffffff',
    tableRowHover: '#f4f8f6',
    input: '#f4f8f6',
  },

  colors: {
    tealPrimary: '#146f5b',
    tealAccent: '#16785f',
    tealLight: '#07888a',
    emerald: '#059669',
    amber: '#b45309',
    rose: '#e11d48',
    violet: '#7c3aed',
  },

  cards: {
    movingBorderCard: "bg-white border border-[#d8eae5] rounded-2xl p-6 shadow-[0_10px_30px_rgba(20,67,60,0.07)]",
    kpiCard: "bg-white border border-[#d8eae5] rounded-2xl p-5 transition-all duration-300 hover:border-[#a7d4c5]",
    glassCyber: "bg-white border border-[#d8eae5] rounded-2xl p-6 shadow-[0_10px_30px_rgba(20,67,60,0.07)]",
    waterBreathing: "bg-white border border-[#d8eae5] rounded-2xl p-6 shadow-[0_10px_30px_rgba(20,67,60,0.07)]",
  },

  buttons: {
    glowingAction: "bg-[#146f5b] text-[#fff] font-bold tracking-wide rounded-lg px-5 py-2.5 shadow-[0_4px_11px_rgba(20,111,91,0.2)] hover:bg-[#105c4b] transition-all",
    primary: "bg-[#146f5b] hover:bg-[#105c4b] text-[#fff] font-semibold shadow-[0_4px_11px_rgba(20,111,91,0.2)] transition-all duration-300 rounded-lg px-4 py-2.5",
    secondary: "bg-white border border-[#d8eae5] hover:border-[#a7d4c5] text-[#557875] hover:text-[#123c35] hover:bg-[#f4f8f6] transition-all duration-300 rounded-lg px-4 py-2.5",
    danger: "bg-[#E11D48] hover:bg-[#BE123C] text-[#fff] font-semibold rounded-lg px-4 py-2.5",
    ghost: "text-[#557875] hover:text-[#16785f] hover:bg-[#f4f8f6] rounded-lg px-3 py-2 transition-colors",
  },

  icons: {
    cyberGlass: "w-10 h-10 rounded-xl flex items-center justify-center bg-[#e8f5ef] border border-[#c9eee8] text-[#17775e] transition-all duration-300 hover:border-[#a7d4c5]",
    amberGlass: "w-10 h-10 rounded-xl flex items-center justify-center bg-[#fef3c7] border border-[#fde68a] text-[#b45309] transition-all duration-300 hover:border-[#fcd34d]",
    flameGlass: "w-10 h-10 rounded-xl flex items-center justify-center bg-[#fee2e2] border border-[#fecaca] text-[#e11d48] transition-all duration-300 hover:border-[#fca5a5]",
    emeraldGlass: "w-10 h-10 rounded-xl flex items-center justify-center bg-[#d1fae5] border border-[#a7f3d0] text-[#059669] transition-all duration-300 hover:border-[#6ee7b7]",
    iconButton: "w-9 h-9 rounded-xl flex items-center justify-center bg-[#f4f8f6] border border-[#d8eae5] text-[#557875] hover:text-[#16785f] hover:border-[#a7d4c5] hover:bg-[#e5f3ed] transition-all duration-300 active:scale-95",
  },

  forms: {
    input: "bg-[#f4f8f6] border border-[#d8eae5] focus:border-[#16785f] focus:ring-1 focus:ring-[#16785f] text-[#103e3c] placeholder:text-[#81948c] rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none",
    inputNumeric: "bg-[#f4f8f6] border border-[#d8eae5] focus:border-[#16785f] focus:ring-1 focus:ring-[#16785f] text-[#16785f] placeholder:text-[#81948c] rounded-lg px-3.5 py-2.5 font-mono text-sm font-bold text-right outline-none",
    select: "bg-[#f4f8f6] border border-[#d8eae5] focus:border-[#16785f] text-[#103e3c] rounded-lg px-3.5 py-2.5 text-sm outline-none cursor-pointer",
    label: "text-xs font-bold text-[#557875] uppercase tracking-wider mb-1.5 block",
    checkbox: "rounded border-[#d8eae5] bg-[#f4f8f6] text-[#146f5b] focus:ring-[#16785f]",
  },

  tables: {
    container: "w-full overflow-hidden rounded-2xl border border-[#d8eae5] bg-white",
    header: "bg-[#f4f8f6] text-xs font-bold text-[#557875] uppercase tracking-wider border-b border-[#e2efeb] px-4 py-3.5 text-left",
    row: "bg-white border-b border-[#e2efeb] hover:bg-[#f4f8f6] transition-colors duration-200",
    cellText: "text-sm text-[#143d34] font-medium px-4 py-3",
    cellNumber: "text-sm text-[#16785f] font-mono font-bold px-4 py-3 text-right",
  },

  charts: {
    tooltipStyle: {
      backgroundColor: '#fff',
      borderColor: '#d8eae5',
      color: '#103e3c',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 25px -5px rgba(20,67,60,0.1)',
    },
  },

  typography: {
    h1: "text-2xl sm:text-3xl font-extrabold text-[#123c35] tracking-tight font-sans",
    h2: "text-base sm:text-lg font-bold text-[#143d34] tracking-wide font-sans",
    h3: "text-xs sm:text-sm font-bold text-[#143d34] uppercase tracking-wider font-mono",
    body: "text-xs sm:text-sm font-semibold text-[#557875] tracking-normal font-sans",
    muted: "text-[11px] sm:text-xs font-medium text-[#81948c] font-mono",
    currency: "text-sm sm:text-xl font-mono font-bold text-[#143d34] tracking-tight",
    inputGuard: "text-base sm:text-sm",
  },

  containerInteractivity: {
    interactiveTier1: "bg-white border border-[#d8eae5] rounded-2xl cursor-pointer transition-all active:scale-[0.98] hover:border-[#a7d4c5]",
    readOnlyTier2: "bg-white border border-[#d8eae5] rounded-2xl cursor-default pointer-events-auto",
    hazardTier3: "bg-white border border-[#fde68a] rounded-2xl relative overflow-hidden",
  },

  formatCurrency: (val) => {
    const num = Number(val) || 0;
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  },
};

export default DESIGN_TOKENS;