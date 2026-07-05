// Concept B — Ambient Focus
// A very soft, global radial glow emanates from the screen centre and edges
// on the Practice screen only. Nothing else changes: same cards, same nav, same typography.

export function ConceptB_VerbCard() {
  return (
    <div className="relative min-h-[100dvh] bg-[#0a0b10] font-sans overflow-hidden flex flex-col">

      {/* ── Ambient glow layers ───────────────────────────────────
          Three gradients at very low opacity — two pooling at the
          bottom corners (where the nav sits) and one centred bloom
          that lights the content area from behind.
      ─────────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            // Centred bloom — lights the verb card area softly
            "radial-gradient(ellipse 90% 55% at 50% 52%, rgba(109,40,217,0.07) 0%, transparent 65%)",
            // Bottom wash — radiates up from the nav zone
            "radial-gradient(ellipse 100% 40% at 50% 100%, rgba(109,40,217,0.09) 0%, transparent 55%)",
            // Subtle top coolness to keep depth
            "radial-gradient(ellipse 70% 30% at 50% 0%, rgba(30,20,60,0.4) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 pt-10 pb-1 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/10 bg-white/5">
            <span className="text-white text-xs font-semibold">Training Mode</span>
            <span className="text-gray-500 text-xs">∨</span>
          </div>
          <div className="flex items-center gap-1 h-8 px-3 rounded-full border border-indigo-500/30 bg-white/3">
            <span className="text-indigo-300 text-xs">✦</span>
            <span className="text-white text-xs font-semibold">English Tenses</span>
            <span className="text-gray-500 text-xs">›</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-1.5">
          <span className="text-green-500 text-xs font-bold">✓ 0</span>
          <span className="text-red-500 text-xs font-bold">✕ 0</span>
        </div>
      </div>

      {/* ── Exercise area ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-3 max-w-md mx-auto w-full pb-24">
        {/* Tense pill — unchanged */}
        <span className="bg-indigo-600/20 text-indigo-300 text-xs font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-indigo-500/30">
          Past Simple
        </span>

        {/* Subject card — unchanged */}
        <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 p-5 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Subject</p>
          <p className="text-4xl font-bold text-white">you</p>
        </div>

        {/* Verb card — unchanged */}
        <div className="w-full rounded-2xl bg-[#13151f] border border-indigo-500/20 p-5 flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Verb</p>
          <p className="text-6xl font-black text-indigo-400 tracking-tight">shut</p>
          <p className="text-gray-500 text-sm tracking-wide">/ʃʌt/</p>
          <p className="text-gray-400 text-base">закрывать</p>
        </div>

        {/* Input — unchanged */}
        <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 p-2">
          <div className="w-full h-14 rounded-xl border-2 border-transparent bg-[#0a0b10] flex items-center justify-center">
            <span className="text-gray-600 text-base">Type your answer...</span>
          </div>
        </div>

        {/* Buttons — unchanged */}
        <button className="w-full bg-indigo-600 text-white font-bold text-base h-12 rounded-xl opacity-50 cursor-default">
          Check
        </button>
        <span className="text-gray-600 text-sm">▷ Skip</span>
      </div>

      {/* ── Bottom Navigation — standard, no changes ──────────────── */}
      <nav className="fixed bottom-0 w-full z-50">
        <div className="bg-[#111420] border-t border-white/6">
          <div className="flex justify-around items-center h-16 px-2">

            {/* Home */}
            <div className="flex flex-col items-center justify-center w-full h-full gap-1 opacity-35">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-[10px] text-gray-500">Home</span>
            </div>

            {/* Practice — active, standard treatment */}
            <div className="flex flex-col items-center justify-center w-full h-full gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(139,92,246)" strokeWidth="2.2"><path d="M6 4v16M18 4v16M6 12h12"/></svg>
              <span className="text-[10px] text-indigo-300 font-semibold">Practice</span>
            </div>

            {/* Mistakes */}
            <div className="flex flex-col items-center justify-center w-full h-full gap-1 opacity-35">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-[10px] text-gray-500">Mistakes</span>
            </div>

            {/* Dictionary */}
            <div className="flex flex-col items-center justify-center w-full h-full gap-1 opacity-35">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span className="text-[10px] text-gray-500">Dictionary</span>
            </div>

            {/* Settings */}
            <div className="flex flex-col items-center justify-center w-full h-full gap-1 opacity-35">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span className="text-[10px] text-gray-500">Settings</span>
            </div>

          </div>
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>
      </nav>

    </div>
  );
}
