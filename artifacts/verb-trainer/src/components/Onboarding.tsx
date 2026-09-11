// Onboarding — direct port of the approved Canvas mockups (Screen1–4)
// Uses inline styles verbatim from the mockup source to guarantee visual fidelity.

import { useRef, useState } from "react";
import { ChevronLeft, Dumbbell } from "lucide-react";
import { Button } from "./ui/button";

interface OnboardingProps {
  onComplete: (dailyGoal: number) => void;
  startScreen?: number;
  endScreen?: number;
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

function Pagination({
  activeIndex,
  onBack,
  totalDots = 4,
}: {
  activeIndex: number;
  onBack?: () => void;
  totalDots?: number;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {onBack && (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          style={{
            width: 28,
            height: 24,
            padding: 0,
            marginRight: 2,
            border: "none",
            borderRadius: 12,
            background: "transparent",
            color: MUTED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>
      )}
      {Array.from({ length: totalDots }, (_, index) => (
        <Dot key={index} active={index === activeIndex} />
      ))}
    </div>
  );
}

function BottomAction({
  activeIndex,
  totalDots = 4,
  onBack,
  onClick,
  label,
}: {
  activeIndex: number;
  totalDots?: number;
  onBack?: () => void;
  onClick: () => void;
  label: string;
}) {
  return (
    <div style={{
      flex: "0 0 auto",
      width: "100%",
      height: "calc(164px + env(safe-area-inset-bottom, 0px))",
      padding: "16px 24px calc(48px + env(safe-area-inset-bottom, 0px))",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
       // Keep the visual dots-to-button distance identical whether the
       // pagination includes the 24px back-chevron or not. The chevron
       // increases Pagination's line box by 16px, so reduce the flex gap by
       // the 8px of vertical centering it adds below the dots.
       gap: onBack ? 12 : 20,
      boxSizing: "border-box",
    }}>
      <Pagination activeIndex={activeIndex} totalDots={totalDots} onBack={onBack} />
      <Button
        type="button"
        size="hero"
        className="w-full shrink-0"
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}

function PageTitle({
  children,
  fontSize = 22,
  lineHeight = 1.25,
  marginBottom = 0,
}: {
  children: React.ReactNode;
  fontSize?: number;
  lineHeight?: number;
  marginBottom?: number;
}) {
  return (
    <h2 style={{
      color: FG,
      fontSize,
      fontWeight: 700,
      margin: `0 0 ${marginBottom}px`,
      letterSpacing: "-0.3px",
      lineHeight,
      textAlign: "left",
      alignSelf: "stretch",
    }}>
      {children}
    </h2>
  );
}

// ─── Screen 1 ─────────────────────────────────────────────────────────────────

function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <div style={{
          width: 120, height: 120, marginBottom: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img
            src="/verbflow-onboarding-icon.png"
            alt="VerbFlow"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            sizes="120px"
          />
        </div>
        <h1 style={{ color: FG, fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 20px", lineHeight: 1.2, letterSpacing: "-0.4px" }}>
          Добро пожаловать!
        </h1>
        <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.65, textAlign: "center", margin: 0, maxWidth: 300 }}>
          VerbFlow поможет освоить правильные и неправильные глаголы и разобраться во временах английского языка.
        </p>
      </div>
      <BottomAction
        activeIndex={0}
        onClick={onNext}
        label="Далее"
      />
    </div>
  );
}

// ─── Screen 2 ─────────────────────────────────────────────────────────────────

function Callout2({ n, label, text }: { n: number; label: string; text: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start" }}>
      <div style={{
        width: 26, height: 26, borderRadius: 13, background: PRIMARY, color: "#fff",
        fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{n}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ color: FG, fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>{label}</div>
        <div style={{ color: MUTED, fontSize: 14, lineHeight: "21px" }}>{text}</div>
      </div>
    </div>
  );
}

function PracticePreview() {
  return (
    <div style={{ background: BG, borderRadius: 14, overflow: "hidden", border: `1px solid ${BORDER}`, position: "relative" }}>
      <div style={{ padding: "6px 10px", display: "flex", gap: 6, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ background: "#1A2A44", borderRadius: 7, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
          <span style={{ color: FG, fontSize: 10, fontWeight: 600 }}>Training Mode</span>
          <div style={{ position: "absolute", top: -7, right: -7, width: 16, height: 16, borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
        </div>
        <div style={{ background: "#1A2A44", borderRadius: 7, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
          <span style={{ color: FG, fontSize: 10, fontWeight: 600 }}>English Tenses</span>
          <div style={{ position: "absolute", top: -7, right: -7, width: 16, height: 16, borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
        </div>
      </div>
      <div style={{ padding: "8px 10px 0" }}>
        <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "8px 10px" }}>
          <div style={{ color: MUTED, fontSize: 9, fontWeight: 500, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>Present Simple</div>
          <div style={{ color: MUTED, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Verb</div>
          <div style={{ color: PRIMARY, fontSize: 16, lineHeight: 1.2, fontWeight: 700 }}>speak</div>
          <div style={{ color: MUTED, fontSize: 9, marginTop: 1 }}>he / she / it</div>
        </div>
      </div>
      <div style={{ padding: "6px 10px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, minHeight: 22 }}>
          {"speaks".split("").map((letter, index) => (
            <div key={`${letter}-${index}`} style={{
              width: 16, height: 18, borderBottom: `2px solid ${index < 2 ? PRIMARY : "#2A3A58"}`,
              color: index < 2 ? FG : "transparent", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "flex-start", justifyContent: "center",
            }}>{index < 2 ? letter.toUpperCase() : letter}</div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, position: "relative" }}>
          {["D", "R", "E", "J", "F"].map((letter, index) => (
            <div key={`${letter}-choice-${index}`} style={{
              width: 22, height: 24, borderRadius: 7, background: CARD,
              border: `1px solid ${BORDER}`, color: FG, fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{letter}</div>
          ))}
          <div style={{ position: "absolute", top: -7, right: -7, width: 16, height: 16, borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
        </div>
      </div>
    </div>
  );
}

function Screen2({
  onNext,
  onBack,
  repeatGuide = false,
}: {
  onNext: () => void;
  onBack: () => void;
  repeatGuide?: boolean;
}) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: "0 0 auto" }}>
        <div style={{ padding: "4px 24px 8px" }}>
          <PageTitle>Экран тренировки</PageTitle>
        </div>
        <div style={{ padding: "0 20px" }}>
          <PracticePreview />
        </div>
      </div>
      <div className="scrollbar-hidden" style={{ flex: "1 1 auto", minHeight: 0, padding: "10px 24px 12px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Callout2 n={1} label="Training Mode" text="Выберите формы глаголов и времена, которые хотите тренировать. Используйте режим Context sentences, чтобы практиковать глаголы в предложениях. Повысьте сложность заданий, отключив Letter Builder." />
        <Callout2 n={2} label="English Tenses" text="Если немного запутались во временах английского языка, посмотрите нашу удобную шпаргалку." />
        <Callout2 n={3} label="Поле с заданием" text="Введите правильную форму глагола или нажмите Skip, чтобы пропустить задание." />
      </div>
      <BottomAction
        activeIndex={repeatGuide ? 0 : 1}
        totalDots={repeatGuide ? 2 : 4}
        onBack={repeatGuide ? undefined : onBack}
        onClick={onNext}
        label="Далее"
      />
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
  { key: "Home", label: "Home", icon: navIcons.Home, desc: "Наблюдайте за статистикой ответов и ежедневным прогрессом." },
  { key: "Practice", label: "Practice", icon: navIcons.Practice, desc: "Совершенствуйте язык." },
  { key: "Mistakes", label: "Mistakes", icon: navIcons.Mistakes, desc: "Вернитесь к допущенным ошибкам и отработайте их." },
  { key: "Dictionary", label: "Dictionary", icon: navIcons.Dictionary, desc: "Кликните на глагол, чтобы узнать о его формах больше." },
  { key: "Settings", label: "Settings", icon: navIcons.Settings, desc: "Выберите цель тренировки и ещё раз пройдите гайд." },
];

function Screen3({
  onNext,
  onBack,
  repeatGuide = false,
}: {
  onNext: () => void;
  onBack: () => void;
  repeatGuide?: boolean;
}) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: "0 0 auto" }}>
        <div style={{ padding: "8px 24px 0" }}>
          <PageTitle>
            Всё необходимое —{" "}<br />под рукой
          </PageTitle>
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
      </div>

      {/* Descriptions */}
      <div className="scrollbar-hidden" style={{ flex: "1 1 auto", minHeight: 0, padding: "20px 24px 12px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        {tabs.map((t, i) => (
          <div key={t.key} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start" }}>
            <div style={{
              width: 26, height: 26, borderRadius: 13, background: PRIMARY, color: "#fff",
              fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ color: FG, fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>{t.label}</div>
              <div style={{ color: MUTED, fontSize: 14, lineHeight: "21px" }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <BottomAction
        activeIndex={repeatGuide ? 1 : 2}
        totalDots={repeatGuide ? 2 : 4}
        onBack={onBack}
        onClick={onNext}
        label={repeatGuide ? "Вернуться к обучению" : "Далее"}
      />
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

function Screen4({
  selected,
  onSelect,
  onBack,
  onComplete,
}: {
  selected: number;
  onSelect: (dailyGoal: number) => void;
  onBack: () => void;
  onComplete: (dailyGoal: number) => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 24px 0" }}>
        <PageTitle marginBottom={10}>
          Остался последний шаг
        </PageTitle>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "0 0 32px" }}>
          Выберите количество слов, которое хотите тренировать каждый день. Это можно изменить позже в настройках приложения.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {goals.map((g) => {
            const isSelected = selected === g.words;
            return (
              <button
                key={g.words}
                onClick={() => onSelect(g.words)}
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
      <BottomAction
        activeIndex={3}
        onBack={onBack}
        onClick={() => onComplete(selected)}
        label="Начать обучение"
      />
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function Onboarding({
  onComplete,
  startScreen = 0,
  endScreen = 3,
}: OnboardingProps) {
  const [screen, setScreen] = useState(startScreen);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "back">("forward");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const repeatGuide = startScreen === 1 && endScreen === 2;

  const goTo = (nextScreen: number, direction: "forward" | "back") => {
    setTransitionDirection(direction);
    setScreen(nextScreen);
  };

  const next = () => {
    if (screen >= endScreen) {
      onComplete(dailyGoal);
      return;
    }
    goTo(Math.min(screen + 1, endScreen), "forward");
  };
  const previous = () => {
    if (screen > startScreen) goTo(screen - 1, "back");
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const isHorizontalSwipe = Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (!isHorizontalSwipe) return;
    if (deltaX < 0 && screen <= endScreen) next();
    if (deltaX > 0 && screen > startScreen) previous();
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ width: "100%", height: "100dvh", background: BG, fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "center", overflow: "hidden", touchAction: "pan-y" }}
    >
      <style>{`
        @keyframes onboarding-slide-forward {
          from { opacity: 0.6; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes onboarding-slide-back {
          from { opacity: 0.6; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: 480, height: "100%", display: "flex", flexDirection: "column", paddingTop: "max(env(safe-area-inset-top, 0px), 28px)", position: "relative" }}>
        <div
          key={screen}
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            animation: `${transitionDirection === "forward" ? "onboarding-slide-forward" : "onboarding-slide-back"} 180ms ease-out`,
          }}
        >
          {screen === 0 && <Screen1 onNext={next} />}
          {screen === 1 && (
            <Screen2
              onNext={next}
              onBack={previous}
              repeatGuide={repeatGuide}
            />
          )}
          {screen === 2 && (
            <Screen3
              onNext={next}
              onBack={previous}
              repeatGuide={repeatGuide}
            />
          )}
          {screen === 3 && (
            <Screen4
              selected={dailyGoal}
              onSelect={setDailyGoal}
              onBack={previous}
              onComplete={onComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
