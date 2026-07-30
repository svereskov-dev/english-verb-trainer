// Onboarding — direct port of the approved Canvas mockups (Screen1–4)
// Uses inline styles verbatim from the mockup source to guarantee visual fidelity.

import { useState } from "react";
import { Dumbbell } from "lucide-react";

interface OnboardingProps {
  onComplete: (dailyGoal: number) => void;
}

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
      background: active ? PRIMARY : "#2A3A58", transition: "width 0.2s",
    }} />
  );
}

// ─── Screen 1 ─────────────────────────────────────────────────────────────────

function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <div style={{
          width: 120, height: 120, borderRadius: 28, overflow: "hidden", marginBottom: 40,
          boxShadow: `0 0 0 1px ${BORDER}, 0 16px 48px rgba(108,71,255,0.3)`,
          background: "#0B1A3A",
        }}>
          <img
            src="/verbflow-icon.png"
            alt="VerbFlow"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            sizes="120px"
          />
        </div>
        <h1 style={{ color: FG, fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 20px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          Добро пожаловать!
        </h1>
        <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.65, textAlign: "center", margin: 0, maxWidth: 300 }}>
          VerbFlow поможет освоить правильные и неправильные глаголы и разобраться во временах английского языка.
        </p>
      </div>
      <div style={{ width: "100%", padding: "0 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={true} /><Dot active={false} /><Dot active={false} /><Dot active={false} />
        </div>
        <button onClick={onNext} style={{
          width: "100%", height: 56, background: PRIMARY, border: "none",
          borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: "pointer", letterSpacing: "0.1px",
          boxShadow: `0 8px 24px rgba(108,71,255,0.4)`,
        }}>Далее</button>
      </div>
    </div>
  );
}

// ─── Screen 2 ─────────────────────────────────────────────────────────────────

function Callout2({ n, label, text }: { n: number; label: string; text: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start" }}>
      <div style={{
        width: 24, height: 24, borderRadius: 12, background: PRIMARY, color: "#fff",
        fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{n}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ color: FG, fontSize: 13, fontWeight: 600, lineHeight: "20px" }}>{label}</div>
        <div style={{ color: MUTED, fontSize: 12, lineHeight: "18px" }}>{text}</div>
      </div>
    </div>
  );
}

function PracticePreview() {
  return (
    <div style={{ background: BG, borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}`, position: "relative" }}>
      <div style={{ background: "#1A2A44", height: 4, width: "100%" }}>
        <div style={{ background: PRIMARY, height: "100%", width: "40%", borderRadius: 2 }} />
      </div>
      <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ background: "#1A2A44", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5">
            <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5Z"/><path d="M12 2v20M2 8.5l10 7 10-7"/>
          </svg>
          <span style={{ color: FG, fontSize: 11, fontWeight: 600 }}>Training Mode</span>
          <div style={{ position: "absolute", top: -8, right: -8, width: 18, height: 18, borderRadius: 9, background: PRIMARY, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
        </div>
        <div style={{ background: "#1A2A44", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span style={{ color: FG, fontSize: 11, fontWeight: 600 }}>English Tenses</span>
          <div style={{ position: "absolute", top: -8, right: -8, width: 18, height: 18, borderRadius: 9, background: PRIMARY, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
        </div>
      </div>
      <div style={{ padding: "10px 12px 0" }}>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "10px 14px" }}>
          <div style={{ color: MUTED, fontSize: 10, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Present Simple</div>
          <div style={{ color: FG, fontSize: 13, lineHeight: 1.5 }}>
            She <span style={{ color: PRIMARY, fontWeight: 700 }}>_____</span> English every day.
          </div>
          <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>speak → ?</div>
        </div>
      </div>
      <div style={{ padding: "8px 12px 10px", display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: "#1A2A44", borderRadius: 10, border: `1.5px solid ${PRIMARY}`, padding: "7px 12px", display: "flex", alignItems: "center", position: "relative" }}>
          <span style={{ color: FG, fontSize: 12, fontWeight: 500 }}>speaks</span>
          <div style={{ position: "absolute", top: -8, right: -8, width: 18, height: 18, borderRadius: 9, background: PRIMARY, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
        </div>
        <button style={{ background: PRIMARY, border: "none", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>Check</button>
      </div>
    </div>
  );
}

function Screen2({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "8px 24px 12px" }}>
        <h2 style={{ color: FG, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>Экран тренировки</h2>
      </div>
      <div style={{ padding: "0 20px" }}>
        <PracticePreview />
      </div>
      <div style={{ flex: 1, padding: "16px 24px 0", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Callout2 n={1} label="Training Mode" text="Настройте тренировку под себя: выберите формы глаголов и времена, которые хотите практиковать." />
        <Callout2 n={2} label="English Tenses" text="Наглядная схема времён английского языка, если захотите освежить знания." />
        <Callout2 n={3} label="Поле с заданием" text="Введите правильную форму глагола и нажмите Check, чтобы проверить результат." />
      </div>
      <div style={{ width: "100%", padding: "16px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={false}/><Dot active={true}/><Dot active={false}/><Dot active={false}/>
        </div>
        <button onClick={onNext} style={{
          width: "100%", height: 52, background: PRIMARY, border: "none",
          borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: "pointer", boxShadow: `0 8px 24px rgba(108,71,255,0.4)`,
        }}>Далее</button>
      </div>
    </div>
  );
}

// ─── Screen 3 ─────────────────────────────────────────────────────────────────

const navIcons = {
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
  { key: "Home", label: "Главная", icon: navIcons.Home, desc: "Наблюдаем за статистикой ответов и ежедневным прогрессом." },
  { key: "Practice", label: "Практика", icon: navIcons.Practice, desc: "Совершенствуем язык." },
  { key: "Mistakes", label: "Ошибки", icon: navIcons.Mistakes, desc: "Изучаем список ошибок, допущенных в течение дня." },
  { key: "Dictionary", label: "Словарь", icon: navIcons.Dictionary, desc: "При клике на глагол можно увидеть его перевод, транскрипцию и основные формы." },
  { key: "Settings", label: "Настройки", icon: navIcons.Settings, desc: "Выбираем цель ежедневной тренировки." },
];

function Screen3({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "8px 24px 0" }}>
        <h2 style={{ color: FG, fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          Всё необходимое —{" "}<br />под рукой
        </h2>
      </div>

      {/* Nav bar visual */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden" }}>
          {/* Arrow indicators */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: "10px 4px 0" }}>
            {tabs.map((t, i) => (
              <div key={t.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 12, background: PRIMARY, color: "#fff",
                  fontSize: 11, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
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
          <div key={t.key} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start" }}>
            <div style={{
              width: 24, height: 24, borderRadius: 12, background: PRIMARY, color: "#fff",
              fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ color: FG, fontSize: 13, fontWeight: 600, lineHeight: "20px" }}>{t.label}</div>
              <div style={{ color: MUTED, fontSize: 12, lineHeight: "18px" }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={false}/><Dot active={false}/><Dot active={true}/><Dot active={false}/>
        </div>
        <button onClick={onNext} style={{
          width: "100%", height: 52, background: PRIMARY, border: "none",
          borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: "pointer", boxShadow: `0 8px 24px rgba(108,71,255,0.4)`,
        }}>Далее</button>
      </div>
    </div>
  );
}

// ─── Screen 4 ─────────────────────────────────────────────────────────────────

const goals = [
  { words: 10, emoji: "🌱" },
  { words: 20, emoji: "⚡" },
  { words: 35, emoji: "🔥" },
  { words: 50, emoji: "🚀" },
];

function Screen4({ onComplete }: { onComplete: (dailyGoal: number) => void }) {
  const [selected, setSelected] = useState(20);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 24px 0" }}>
        <h2 style={{ color: FG, fontSize: 26, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.3px", lineHeight: 1.25 }}>
          Остался последний шаг
        </h2>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
          Выберите количество слов, которое хотите тренировать каждый день. Это можно изменить позже в настройках приложения.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {goals.map((g) => {
            const isSelected = selected === g.words;
            return (
              <button
                key={g.words}
                onClick={() => setSelected(g.words)}
                style={{
                  background: isSelected ? "rgba(108,71,255,0.12)" : CARD,
                  border: `1.5px solid ${isSelected ? PRIMARY : BORDER}`,
                  borderRadius: 16, padding: "16px 20px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 16, textAlign: "left",
                  boxShadow: isSelected ? `0 0 0 1px ${PRIMARY}33, 0 4px 16px rgba(108,71,255,0.2)` : "none",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                  border: `2px solid ${isSelected ? PRIMARY : BORDER}`,
                  background: isSelected ? PRIMARY : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />}
                </div>
                <span style={{ fontSize: 24 }}>{g.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ color: isSelected ? "#fff" : FG, fontSize: 18, fontWeight: 700 }}>{g.words}</span>
                    <span style={{ color: isSelected ? "#fff" : FG, fontSize: 14, fontWeight: 500 }}>слов</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "20px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Dot active={false}/><Dot active={false}/><Dot active={false}/><Dot active={true}/>
        </div>
        <button onClick={() => onComplete(selected)} style={{
          width: "100%", height: 56, background: PRIMARY, border: "none",
          borderRadius: 16, color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: "pointer", letterSpacing: "0.1px",
          boxShadow: `0 8px 24px rgba(108,71,255,0.4)`,
        }}>Начать обучение</button>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const next = () => setScreen((s) => Math.min(s + 1, 3));

  return (
    <div style={{ width: "100%", height: "100dvh", background: BG, fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ width: "100%", maxWidth: 480, height: "100%", display: "flex", flexDirection: "column", paddingTop: "max(env(safe-area-inset-top, 0px), 28px)" }}>
        {screen === 0 && <Screen1 onNext={next} />}
        {screen === 1 && <Screen2 onNext={next} />}
        {screen === 2 && <Screen3 onNext={next} />}
        {screen === 3 && <Screen4 onComplete={onComplete} />}
      </div>
    </div>
  );
}
