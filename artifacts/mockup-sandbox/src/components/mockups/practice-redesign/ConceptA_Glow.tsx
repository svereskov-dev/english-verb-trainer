export function ConceptA_Glow() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0b10] flex flex-col items-center p-5 pt-14 gap-5 font-sans relative overflow-hidden">
      {/* Ambient screen edge glow — extremely soft, barely perceptible */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 60% at 50% 100%, rgba(139,92,246,0.055) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.035) 0%, transparent 65%)
          `,
        }}
      />
      {/* Side washes — even softer */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 40% 80% at 0% 50%, rgba(139,92,246,0.025) 0%, transparent 60%),
            radial-gradient(ellipse 40% 80% at 100% 50%, rgba(139,92,246,0.025) 0%, transparent 60%)
          `,
        }}
      />

      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 self-start z-10 relative">
        Concept A — Ambient Screen Glow
      </p>

      {/* Tense badge */}
      <div className="self-stretch flex justify-center z-10 relative">
        <span className="bg-indigo-600/20 text-indigo-300 text-xs font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-indigo-500/30">
          Past Simple
        </span>
      </div>

      {/* Subject card */}
      <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 p-5 flex flex-col items-center gap-1 z-10 relative">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Subject</p>
        <p className="text-4xl font-bold text-white">you</p>
      </div>

      {/* Verb card */}
      <div className="w-full rounded-2xl bg-[#13151f] border border-indigo-500/20 p-5 flex flex-col items-center gap-2 z-10 relative">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Verb</p>
        <p className="text-6xl font-black text-indigo-400 tracking-tight">shut</p>
        <p className="text-gray-400 text-base">закрывать</p>
      </div>

      {/* Answer input */}
      <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 px-5 py-4 flex items-center z-10 relative">
        <span className="text-gray-600 text-base">Type your answer...</span>
      </div>

      {/* Buttons */}
      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base h-12 rounded-xl z-10 relative">
        Check
      </button>
      <button className="text-gray-500 text-sm flex items-center gap-1 z-10 relative">
        ▷ Skip
      </button>
    </div>
  );
}
