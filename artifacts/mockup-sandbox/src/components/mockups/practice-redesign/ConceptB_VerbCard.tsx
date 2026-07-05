export function ConceptB_VerbCard() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0b10] flex flex-col items-center p-5 pt-14 gap-5 font-sans">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 self-start">
        Concept B — Highlighted Verb Card
      </p>

      {/* Tense badge */}
      <div className="self-stretch flex justify-center">
        <span className="bg-indigo-600/20 text-indigo-300 text-xs font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-indigo-500/30">
          Past Simple
        </span>
      </div>

      {/* Subject card — unchanged */}
      <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 p-5 flex flex-col items-center gap-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Subject</p>
        <p className="text-4xl font-bold text-white">you</p>
      </div>

      {/* Verb card — subtly elevated with soft glow and depth */}
      <div
        className="w-full rounded-2xl bg-[#13151f] p-5 flex flex-col items-center gap-2 relative"
        style={{
          border: "1px solid rgba(139,92,246,0.20)",
          boxShadow: `
            0 0 40px rgba(139,92,246,0.08),
            0 8px 32px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.04)
          `,
        }}
      >
        {/* Subtle inner glow wash */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,0.10) 0%, transparent 70%)",
          }}
        />
        <p className="text-[10px] uppercase tracking-widest text-indigo-400/60 font-semibold relative z-10">Verb</p>
        <p className="text-6xl font-black text-indigo-300 tracking-tight relative z-10">shut</p>
        <p className="text-gray-400 text-base relative z-10">закрывать</p>
      </div>

      {/* Answer input */}
      <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 px-5 py-4 flex items-center">
        <span className="text-gray-600 text-base">Type your answer...</span>
      </div>

      {/* Buttons */}
      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base h-12 rounded-xl">
        Check
      </button>
      <button className="text-gray-500 text-sm flex items-center gap-1">
        ▷ Skip
      </button>
    </div>
  );
}
