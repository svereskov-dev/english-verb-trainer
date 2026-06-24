export function VariantC() {
  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col items-center p-5 pt-14 gap-4 font-sans">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 self-start">Variant C — Segmented Cards</p>

      {/* Top row: tense + subject side by side */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#13151f] border border-white/5 p-4 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Tense</p>
          <p className="text-sm font-bold text-indigo-300 text-center leading-snug">Past Simple</p>
        </div>
        <div className="rounded-2xl bg-[#13151f] border border-white/5 p-4 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Subject</p>
          <p className="text-2xl font-bold text-white">you</p>
        </div>
      </div>

      {/* Verb hero card */}
      <div className="w-full rounded-2xl bg-indigo-600/10 border border-indigo-500/25 p-7 flex flex-col items-center gap-2">
        <p className="text-[10px] uppercase tracking-widest text-indigo-400/70 font-semibold">Verb</p>
        <p className="text-7xl font-black text-indigo-300 tracking-tight">shut</p>
        <p className="text-gray-400 text-base mt-1">закрывать</p>
      </div>

      {/* Answer input */}
      <div className="w-full rounded-2xl bg-[#13151f] border border-white/5 px-5 py-4 flex items-center">
        <span className="text-gray-600 text-base">Type your answer...</span>
      </div>

      {/* Buttons */}
      <button className="w-full bg-indigo-600 text-white font-bold text-base h-12 rounded-xl">
        Check
      </button>
      <button className="text-gray-500 text-sm flex items-center gap-1">
        ▷ Skip
      </button>
    </div>
  );
}
