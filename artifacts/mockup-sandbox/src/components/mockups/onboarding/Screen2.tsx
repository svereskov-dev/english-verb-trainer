// Onboarding Screen 2 — Practice screen explanation

const BG = "#060C18";
const CARD = "#0D1425";
const PRIMARY = "#6C47FF";
const FG = "#E2E8F0";
const MUTED = "#7A8DAA";
const BORDER = "#1A2A44";
const SUCCESS = "#22c55e";

function Dot({ active }: { active: boolean }) {
  return (
    <div style={{
      width: active ? 24 : 8, height: 8, borderRadius: 4,
      background: active ? PRIMARY : "#2A3A58", transition: "width 0.2s",
    }} />
  );
}

function Callout({ n, label, text }: { n: number; label: string; text: string }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 12,
      alignItems: "start",
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 12,
        background: PRIMARY, color: "#fff",
        fontSize: 12, fontWeight: 700, lineHeight: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{n}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ color: FG, fontSize: 13, fontWeight: 600, lineHeight: "20px" }}>{label}</div>
        <div style={{ color: MUTED, fontSize: 12, lineHeight: "18px" }}>{text}</div>
      </div>
    </div>
  );
}

// Mini practice screen mockup
function PracticePreview() {
  return (
    <div style={{
      background: BG, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${BORDER}`,
      position: "relative",
    }}>
      {/* Progress bar */}
      <div style={{ background: "#1A2A44", height: 4, width: "100%" }}>
        <div style={{ background: PRIMARY, height: "100%", width: "40%", borderRadius: 2 }} />
      </div>

      {/* Top bar */}
      <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{
          background: "#1A2A44", borderRadius: 8, padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 5,
          position: "relative",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5"><path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5Z"/><path d="M12 2v20M2 8.5l10 7 10-7"/></svg>
          <span style={{ color: FG, fontSize: 11, fontWeight: 600 }}>Training Mode</span>
          {/* callout badge */}
          <div style={{
            position: "absolute", top: -8, right: -8,
            width: 18, height: 18, borderRadius: 9, background: PRIMARY,
            color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>1</div>
        </div>
        <div style={{
          background: "#1A2A44", borderRadius: 8, padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 5,
          position: "relative",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span style={{ color: FG, fontSize: 11, fontWeight: 600 }}>English Tenses</span>
          <div style={{
            position: "absolute", top: -8, right: -8,
            width: 18, height: 18, borderRadius: 9, background: PRIMARY,
            color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>2</div>
        </div>
      </div>

      {/* Exercise card */}
      <div style={{ padding: "10px 12px 0" }}>
        <div style={{
          background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`,
          padding: "10px 14px",
        }}>
          <div style={{ color: MUTED, fontSize: 10, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Present Simple</div>
          <div style={{ color: FG, fontSize: 13, lineHeight: 1.5 }}>
            She <span style={{ color: PRIMARY, fontWeight: 700 }}>_____</span> English every day.
          </div>
          <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>speak → ?</div>
        </div>
      </div>

      {/* Input + button */}
      <div style={{ padding: "8px 12px 10px", display: "flex", gap: 8 }}>
        <div style={{
          flex: 1, background: "#1A2A44", borderRadius: 10,
          border: `1.5px solid ${PRIMARY}`, padding: "7px 12px",
          display: "flex", alignItems: "center", position: "relative",
        }}>
          <span style={{ color: FG, fontSize: 12, fontWeight: 500 }}>speaks</span>
          {/* callout badge */}
          <div style={{
            position: "absolute", top: -8, right: -8,
            width: 18, height: 18, borderRadius: 9, background: PRIMARY,
            color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>3</div>
        </div>
        <button style={{
          background: PRIMARY, border: "none", borderRadius: 10,
          color: "#fff", fontSize: 12, fontWeight: 600,
          padding: "7px 14px", cursor: "pointer",
        }}>Check</button>
      </div>
    </div>
  );
}

export function Screen2() {
  return (
    <div style={{
      width: 390, height: 844, background: BG,
      fontFamily: "'Inter', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
        <span style={{ color: FG, fontSize: 15, fontWeight: 600 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 25, height: 12, border: `1.5px solid ${FG}`, borderRadius: 3, padding: 2, display: "flex", alignItems: "center" }}>
            <div style={{ width: 16, height: 7, background: FG, borderRadius: 1 }}/>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "8px 24px 12px" }}>
        <h2 style={{ color: FG, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
          Экран тренировки
        </h2>
      </div>

      {/* Practice preview */}
      <div style={{ padding: "0 20px" }}>
        <PracticePreview />
      </div>

      {/* Callouts */}
      <div style={{ flex: 1, padding: "16px 24px 0", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Callout n={1} label="Training Mode"
          text="Настройте тренировку под себя: выберите формы глаголов и времена, которые хотите практиковать." />
        <Callout n={2} label="English Tenses"
          text="Наглядная схема времён английского языка, если захотите освежить знания." />
        <Callout n={3} label="Поле с заданием"
          text="Введите правильную форму глагола и нажмите Check, чтобы проверить результат." />
      </div>

      {/* Bottom */}
      <div style={{ width: "100%", padding: "16px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={false} /><Dot active={true} /><Dot active={false} /><Dot active={false} />
        </div>
        <button style={{
          width: "100%", height: 52, background: PRIMARY, border: "none",
          borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: "pointer", boxShadow: `0 8px 24px rgba(108,71,255,0.4)`,
        }}>Далее</button>
      </div>
    </div>
  );
}
