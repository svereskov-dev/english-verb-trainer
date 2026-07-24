// Onboarding Screen 3 — Bottom navigation explanation

import { Dumbbell } from "lucide-react";

const BG = "#060C18";
const CARD = "#0D1425";
const PRIMARY = "#6C47FF";
const FG = "#E2E8F0";
const MUTED = "#7A8DAA";
const BORDER = "#1A2A44";

function Dot({ active }: { active: boolean }) {
  return (
    <div style={{
      width: active ? 24 : 8, height: 8, borderRadius: 4,
      background: active ? PRIMARY : "#2A3A58",
    }} />
  );
}

// Nav tab icons (inline SVG matching Lucide icons)
const icons = {
  Home: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Practice: (color: string) => <Dumbbell size={20} color={color} strokeWidth={2} />,
  Mistakes: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Dictionary: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  Settings: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
};

const tabs = [
  { key: "Home", label: "Главная", icon: icons.Home, desc: "Наблюдаем за статистикой ответов и ежедневным прогрессом." },
  { key: "Practice", label: "Практика", icon: icons.Practice, desc: "Совершенствуем язык." },
  { key: "Mistakes", label: "Ошибки", icon: icons.Mistakes, desc: "Изучаем список ошибок, допущенных в течение дня." },
  { key: "Dictionary", label: "Словарь", icon: icons.Dictionary, desc: "При клике на глагол можно увидеть его перевод, транскрипцию и основные формы." },
  { key: "Settings", label: "Настройки", icon: icons.Settings, desc: "Выбираем цель ежедневной тренировки." },
];

export function Screen3() {
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
        <div style={{ width: 25, height: 12, border: `1.5px solid ${FG}`, borderRadius: 3, padding: 2, display: "flex", alignItems: "center" }}>
          <div style={{ width: 16, height: 7, background: FG, borderRadius: 1 }}/>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "8px 24px 0" }}>
        <h2 style={{ color: FG, fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          Всё необходимое —{" "}
          <br />под рукой
        </h2>
      </div>

      {/* Nav bar visual */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 20, overflow: "hidden",
        }}>
          {/* Arrow indicators */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: "10px 4px 0" }}>
            {tabs.map((t, i) => (
              <div key={t.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: PRIMARY, color: "#fff",
                  fontSize: 11, fontWeight: 700, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</div>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2v6M2 6l3 3 3-3" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>

          {/* Nav bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", height: 64, alignItems: "center", padding: "0 4px" }}>
            {tabs.map((t, i) => {
              const active = i === 0;
              const color = active ? PRIMARY : MUTED;
              return (
                <div key={t.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  {t.icon(color)}
                  <span style={{ fontSize: 10, fontWeight: 500, color }}>{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div style={{ flex: 1, padding: "20px 24px 0", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        {tabs.map((t, i) => (
          <div key={t.key} style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 12,
            alignItems: "start",
            height: 58,
            overflow: "hidden",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 12,
              background: PRIMARY, color: "#fff",
              fontSize: 12, fontWeight: 700, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ color: FG, fontSize: 13, fontWeight: 600, lineHeight: "20px" }}>{t.label}</div>
              <div style={{ color: MUTED, fontSize: 12, lineHeight: "18px" }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ padding: "16px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={false}/><Dot active={false}/><Dot active={true}/><Dot active={false}/>
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
