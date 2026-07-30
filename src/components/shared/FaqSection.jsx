import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, ChevronUp } from "lucide-react";

export const FaqSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState(0);

  const faqs = [
    {
      category: "POS Hardware",
      question: "Which barcode scanners and receipt printers are supported?",
      answer: "OmniStock supports all standard USB and Bluetooth HID barcode scanners plug-and-play. ESC/POS thermal printers (58mm and 80mm) connect directly via native browser printing or Bluetooth."
    },
    {
      category: "Offline Mode",
      question: "Does OmniStock work 100% offline when the internet dies?",
      answer: "Yes! Powered by Dexie.js IndexedDB, OmniStock saves every sale, inventory deduction, and customer loyalty point locally on your device. Once reconnected, transactions auto-sync seamlessly."
    },
    {
      category: "Self-Hosting",
      question: "How does the Self-Host store sanitization package work?",
      answer: "Clicking 'Deploy Clean Self-Host Store' purges all sample products, mock receipts, and demo barcode data, giving you a 100% clean store register ready for your real inventory."
    },
    {
      category: "Integrations",
      question: "Can I sync transactions automatically to Google Sheets?",
      answer: "Yes, OmniStock can log every sale directly to your Google Sheets spreadsheet on a daily, weekly, or real-time schedule."
    }
  ];

  const categories = ["All", "POS Hardware", "Offline Mode", "Self-Hosting", "Integrations"];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="py-20 bg-slate-950 border-t border-slate-800/80 px-6 md:px-10 text-left text-slate-100">
      <div className="max-w-[1000px] mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-semibold uppercase">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>OmniStock Help & FAQs</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Got Questions About OmniStock POS?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Everything you need to know about setting up barcode scanning, offline registers, and self-hosting.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search POS questions (e.g. offline, barcode, printers)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 outline-none focus:border-sky-500 font-sans shadow-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-sky-600 text-white border-sky-500 shadow-md"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono font-bold uppercase border border-sky-500/20">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-white text-sm md:text-base">{faq.question}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 text-xs md:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pt-4 bg-slate-950/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
