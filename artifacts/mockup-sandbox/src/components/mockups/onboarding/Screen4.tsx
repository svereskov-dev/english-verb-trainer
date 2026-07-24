// Onboarding Screen 4 — Daily goal selection

import { useState } from "react";

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

const goals = [
  { words: 10, emoji: "🌱" },
  { words: 20, emoji: "⚡" },
  { words: 35, emoji: "🔥" },
  { words: 50, emoji: "🚀" },
];

export function Screen4() {
  const [selected, setSelected] = useState(20);

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

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 24px 0" }}>
        <h2 style={{ color: FG, fontSize: 26, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.3px", lineHeight: 1.25 }}>
          Остался последний шаг
        </h2>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
          Выберите количество слов, которое хотите тренировать каждый день. Это можно изменить позже в настройках приложения.
        </p>

        {/* Goal cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {goals.map((g) => {
            const isSelected = selected === g.words;
            return (
              <button
                key={g.words}
                onClick={() => setSelected(g.words)}
                style={{
                  background: isSelected ? `rgba(108,71,255,0.12)` : CARD,
                  border: `1.5px solid ${isSelected ? PRIMARY : BORDER}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  transition: "all 0.15s",
                  boxShadow: isSelected ? `0 0 0 1px ${PRIMARY}33, 0 4px 16px rgba(108,71,255,0.2)` : "none",
                }}
              >
                {/* Radio */}
                <div style={{
                  width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                  border: `2px solid ${isSelected ? PRIMARY : BORDER}`,
                  background: isSelected ? PRIMARY : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && (
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />
                  )}
                </div>

                {/* Emoji */}
                <span style={{ fontSize: 24 }}>{g.emoji}</span>

                {/* Labels */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ color: isSelected ? "#fff" : FG, fontSize: 18, fontWeight: 700 }}>
                      {g.words}
                    </span>
                    <span style={{ color: isSelected ? "#fff" : FG, fontSize: 14, fontWeight: 500 }}>
                      слов
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding: "20px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={false}/><Dot active={false}/><Dot active={false}/><Dot active={true}/>
        </div>
        <button style={{
          width: "100%", height: 56, background: PRIMARY, border: "none",
          borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: "pointer", letterSpacing: "0.1px",
          boxShadow: `0 8px 24px rgba(108,71,255,0.4)`,
        }}>Начать обучение</button>
      </div>
    </div>
  );
}
