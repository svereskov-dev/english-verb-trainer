// Onboarding Screen 1 prototype — icon artwork without the light background

const BG = "#060C18";
const PRIMARY = "#6C47FF";
const FG = "#E2E8F0";
const MUTED = "#7A8DAA";

function Dot({ active }: { active: boolean }) {
  return (
    <div
      style={{
        width: active ? 24 : 8,
        height: 8,
        borderRadius: 4,
        background: active ? PRIMARY : "#2A3A58",
        transition: "width 0.2s",
      }}
    />
  );
}

export function Screen1NoIconBackground() {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: BG,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Status bar */}
      <div style={{ width: "100%", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
        <span style={{ color: FG, fontSize: 15, fontWeight: 600 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="3" width="3" height="9" rx="1" fill={FG} opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill={FG} opacity="0.6"/><rect x="9" y="0" width="3" height="12" rx="1" fill={FG}/><rect x="13.5" y="0" width="3" height="12" rx="1" fill={FG} opacity="0.3"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 4C13.6 1.9 11 0.5 8 0.5C5 0.5 2.4 1.9 0.5 4L1.8 5.3C3.3 3.6 5.5 2.5 8 2.5Z" fill={FG}/><path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.3L13.6 6C12.1 4.5 10.1 3.5 8 3.5C5.9 3.5 3.9 4.5 2.4 6L3.7 7.3C4.8 6.2 6.3 5.5 8 5.5Z" fill={FG}/><circle cx="8" cy="10" r="1.5" fill={FG}/></svg>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div style={{ width: 25, height: 12, border: `1.5px solid ${FG}`, borderRadius: 3, padding: 2, display: "flex", alignItems: "center" }}>
              <div style={{ width: 16, height: 7, background: FG, borderRadius: 1 }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        {/* Icon artwork only — no light tile, border, or shadow */}
        <div style={{ width: 120, height: 120, marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src="/__mockup/images/verbflow-icon-no-bg.png"
            alt="VerbFlow"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          color: FG,
          fontSize: 32,
          fontWeight: 700,
          textAlign: "center",
          margin: "0 0 20px",
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
        }}>
          Добро пожаловать!
        </h1>

        {/* Body */}
        <p style={{
          color: MUTED,
          fontSize: 16,
          lineHeight: 1.65,
          textAlign: "center",
          margin: 0,
          maxWidth: 300,
        }}>
          VerbFlow поможет освоить правильные и неправильные глаголы и разобраться во временах английского языка.
        </p>
      </div>

      {/* Bottom section */}
      <div style={{ width: "100%", padding: "0 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={true} />
          <Dot active={false} />
          <Dot active={false} />
          <Dot active={false} />
        </div>

        <button style={{
          width: "100%",
          height: 56,
          background: PRIMARY,
          border: "none",
          borderRadius: 16,
          color: "#fff",
          fontSize: 17,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.1px",
          boxShadow: "0 8px 24px rgba(108,71,255,0.4)",
        }}>
          Далее
        </button>
      </div>
    </div>
  );
}