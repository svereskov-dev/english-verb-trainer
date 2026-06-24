export function VariantB() {
  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col items-center p-5 pt-14 gap-5 font-sans">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 self-start">Variant B — Elevated Hero</p>

      {/* Single hero card */}
      <div className="w-full rounded-3xl bg-gradient-to-b from-[#161926] to-[#111420] border border-white/6 p-7 flex flex-col items-center gap-5 shadow-2xl shadow-black/60">
        {/* Tense */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Past Simple</p>

        {/* Subject row */}
        <div className="flex items-center gap-3 w-full justify-center">
          <span className="bg-white/5 text-gray-300 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-lg border border-white/8">
            Subject
          </span>
          <span className="text-2xl font-bold text-white">you</span>
        </div>

        <div className="w-10 h-px bg-white/8" />

        {/* Verb */}
        <div className="flex flex-col items-center gap-2">
          <span className="bg-white/5 text-gray-300 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-lg border border-white/8">
            Verb
          </span>
          <p className="text-7xl font-black text-indigo-400 tracking-tight">shut</p>
          <p className="text-gray-400 text-base mt-1">закрывать</p>
        </div>
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
