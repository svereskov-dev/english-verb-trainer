import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Dumbbell, AlertCircle, BookOpen, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Colors from the approved onboarding prototype
const BG = "#060C18";
const CARD = "#0D1425";
const PRIMARY = "#6C47FF";
const FG = "#E2E8F0";
const MUTED = "#7A8DAA";
const BORDER = "#1A2A44";

interface OnboardingProps {
  onComplete: (dailyGoal: number) => void;
}

const totalScreens = 4;

function Dot({ active }: { active: boolean }) {
  return (
    <div
      className="h-2 rounded-full transition-all duration-200"
      style={{
        width: active ? 24 : 8,
        background: active ? PRIMARY : "#2A3A58",
      }}
    />
  );
}

function StatusBar() {
  return (
    <div
      className="w-full shrink-0 flex items-center justify-between px-6 text-foreground"
      style={{ height: 44, color: FG }}
    >
      <span className="text-[15px] font-semibold">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="3" width="3" height="9" rx="1" fill={FG} opacity="0.4" />
          <rect x="4.5" y="2" width="3" height="10" rx="1" fill={FG} opacity="0.6" />
          <rect x="9" y="0" width="3" height="12" rx="1" fill={FG} />
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill={FG} opacity="0.3" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2.5C10.5 2.5 12.7 3.6 14.2 5.3L15.5 4C13.6 1.9 11 0.5 8 0.5C5 0.5 2.4 1.9 0.5 4L1.8 5.3C3.3 3.6 5.5 2.5 8 2.5Z" fill={FG} />
          <path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.3L13.6 6C12.1 4.5 10.1 3.5 8 3.5C5.9 3.5 3.9 4.5 2.4 6L3.7 7.3C4.8 6.2 6.3 5.5 8 5.5Z" fill={FG} />
          <circle cx="8" cy="10" r="1.5" fill={FG} />
        </svg>
        <div className="flex items-center" style={{ padding: 2 }}>
          <div
            className="rounded-sm flex items-center"
            style={{ width: 25, height: 12, border: `1.5px solid ${FG}`, borderRadius: 3, padding: 2 }}
          >
            <div className="rounded-[1px]" style={{ width: 16, height: 7, background: FG }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full">
        <div
          className="rounded-[28px] overflow-hidden mb-10"
          style={{
            width: 120,
            height: 120,
            boxShadow: `0 0 0 1px ${BORDER}, 0 16px 48px rgba(108,71,255,0.3)`,
          }}
        >
          <img
            src="/pwa-512x512.png"
            alt="VerbFlow"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-[32px] leading-tight font-bold text-center tracking-tight mb-5" style={{ color: FG }}>
          Добро пожаловать!
        </h1>
        <p
          className="text-base leading-relaxed text-center max-w-[300px]"
          style={{ color: MUTED }}
        >
          VerbFlow поможет освоить правильные и неправильные глаголы и разобраться во временах английского языка.
        </p>
      </div>
      <div className="w-full px-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Dot active={true} />
          <Dot active={false} />
          <Dot active={false} />
          <Dot active={false} />
        </div>
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl border-0"
          style={{ background: PRIMARY, boxShadow: `0 8px 24px rgba(108,71,255,0.4)` }}
          onClick={onNext}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}

function Callout({ n, label, text }: { n: number; label: string; text: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: PRIMARY, color: "#fff" }}
      >
        {n}
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold leading-5" style={{ color: FG }}>
          {label}
        </span>
        <span className="text-xs leading-[18px]" style={{ color: MUTED }}>
          {text}
        </span>
      </div>
    </div>
  );
}

function PracticePreview() {
  return (
    <Card
      className="rounded-2xl overflow-hidden border-0 shadow-none"
      style={{ background: BG, border: `1px solid ${BORDER}` }}
    >
      <div className="h-1 w-full" style={{ background: "#1A2A44" }}>
        <div className="h-full rounded-r" style={{ width: "40%", background: PRIMARY }} />
      </div>
      <div
        className="flex gap-2 px-3 py-2"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <Badge label="Training Mode" icon={<Dumbbell size={12} strokeWidth={2.5} color={PRIMARY} />} n={1} />
        <Badge label="English Tenses" icon={<BookOpen size={12} strokeWidth={2.5} color={PRIMARY} />} n={2} />
      </div>
      <CardContent className="p-3 pb-0">
        <div
          className="rounded-xl p-2.5 px-3.5"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: MUTED }}>
            Present Simple
          </div>
          <div className="text-[13px] leading-relaxed" style={{ color: FG }}>
            She <span className="font-bold" style={{ color: PRIMARY }}>_____</span> English every day.
          </div>
          <div className="text-[11px] mt-1" style={{ color: MUTED }}>
            speak → ?
          </div>
        </div>
      </CardContent>
      <div className="flex gap-2 p-3">
        <div
          className="relative flex-1 rounded-[10px] flex items-center px-3 text-xs font-medium"
          style={{ background: "#1A2A44", border: `1.5px solid ${PRIMARY}`, color: FG }}
        >
          speaks
          <div
            className="absolute top-0 right-0 -mt-2 -mr-2 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: PRIMARY, color: "#fff" }}
          >
            3
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-[10px] text-xs font-semibold border-0"
          style={{ background: PRIMARY, color: "#fff" }}
        >
          Check
        </Button>
      </div>
    </Card>
  );
}

function Badge({ label, icon, n }: { label: string; icon: React.ReactNode; n: number }) {
  return (
    <div
      className="relative rounded-lg flex items-center gap-1.5 px-2.5 py-1.5"
      style={{ background: "#1A2A44" }}
    >
      {icon}
      <span className="text-[11px] font-semibold" style={{ color: FG }}>
        {label}
      </span>
      <div
        className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: PRIMARY, color: "#fff" }}
      >
        {n}
      </div>
    </div>
  );
}

function Screen2({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-2 pb-3">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: FG }}>
          Экран тренировки
        </h2>
      </div>
      <div className="px-5">
        <PracticePreview />
      </div>
      <div className="flex-1 px-6 pt-4 pb-2 flex flex-col gap-3 overflow-y-auto">
        <Callout
          n={1}
          label="Training Mode"
          text="Настройте тренировку под себя: выберите формы глаголов и времена, которые хотите практиковать."
        />
        <Callout
          n={2}
          label="English Tenses"
          text="Наглядная схема времён английского языка, если захотите освежить знания."
        />
        <Callout
          n={3}
          label="Поле с заданием"
          text="Введите правильную форму глагола и нажмите Check, чтобы проверить результат."
        />
      </div>
      <div className="w-full px-6 pb-12 flex flex-col items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Dot active={false} />
          <Dot active={true} />
          <Dot active={false} />
          <Dot active={false} />
        </div>
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl border-0"
          style={{ background: PRIMARY, boxShadow: `0 8px 24px rgba(108,71,255,0.4)` }}
          onClick={onNext}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}

const tabs: { key: string; label: string; icon: LucideIcon; desc: string }[] = [
  { key: "Home", label: "Главная", icon: Home, desc: "Наблюдаем за статистикой ответов и ежедневным прогрессом." },
  { key: "Practice", label: "Практика", icon: Dumbbell, desc: "Совершенствуем язык." },
  { key: "Mistakes", label: "Ошибки", icon: AlertCircle, desc: "Изучаем список ошибок, допущенных в течение дня." },
  { key: "Dictionary", label: "Словарь", icon: BookOpen, desc: "При клике на глагол можно увидеть его перевод, транскрипцию и основные формы." },
  { key: "Settings", label: "Настройки", icon: Settings, desc: "Выбираем цель ежедневной тренировки." },
];

function Screen3({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-2 pb-0">
        <h2 className="text-[22px] font-bold tracking-tight leading-tight" style={{ color: FG }}>
          Всё необходимое —<br />под рукой
        </h2>
      </div>
      <div className="px-4 pt-5">
        <Card
          className="rounded-[20px] overflow-hidden border-0"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <div className="grid grid-cols-5 pt-2.5 px-1">
            {tabs.map((t, i) => (
              <div key={t.key} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: PRIMARY, color: "#fff" }}
                >
                  {i + 1}
                </div>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2v6M2 6l3 3 3-3" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 h-16 items-center px-1">
            {tabs.map((t, i) => {
              const active = i === 0;
              const color = active ? PRIMARY : MUTED;
              const Icon = t.icon;
              return (
                <div key={t.key} className="flex flex-col items-center gap-0.5">
                  <Icon size={20} color={color} strokeWidth={2} />
                  <span className="text-[10px] font-medium" style={{ color }}>
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="flex-1 px-6 pt-5 pb-2 flex flex-col gap-3 overflow-y-auto">
        {tabs.map((t, i) => (
          <div key={t.key} className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: PRIMARY, color: "#fff" }}
            >
              {i + 1}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold leading-5" style={{ color: FG }}>
                {t.label}
              </span>
              <span className="text-xs leading-[18px]" style={{ color: MUTED }}>
                {t.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full px-6 pb-12 flex flex-col items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Dot active={false} />
          <Dot active={false} />
          <Dot active={true} />
          <Dot active={false} />
        </div>
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl border-0"
          style={{ background: PRIMARY, boxShadow: `0 8px 24px rgba(108,71,255,0.4)` }}
          onClick={onNext}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}

const goals = [
  { words: 20, emoji: "🌱", desc: "5 мин / день" },
  { words: 50, emoji: "⚡", desc: "10 мин / день" },
  { words: 75, emoji: "🔥", desc: "15 мин / день" },
  { words: 100, emoji: "🚀", desc: "20 мин / день" },
];

function Screen4({ onComplete }: { onComplete: (dailyGoal: number) => void }) {
  const [selected, setSelected] = useState(50);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 px-6 pt-2 pb-0 overflow-y-auto">
        <h2
          className="text-[26px] font-bold tracking-tight leading-tight mb-3"
          style={{ color: FG }}
        >
          Остался последний шаг
        </h2>
        <p className="text-[15px] leading-relaxed mb-8" style={{ color: MUTED }}>
          Выберите количество слов, которое хотите тренировать каждый день. Это можно изменить позже в настройках приложения.
        </p>
        <div className="flex flex-col gap-3">
          {goals.map((g) => {
            const isSelected = selected === g.words;
            return (
              <button
                key={g.words}
                onClick={() => setSelected(g.words)}
                className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all"
                style={{
                  background: isSelected ? "rgba(108,71,255,0.12)" : CARD,
                  border: `1.5px solid ${isSelected ? PRIMARY : BORDER}`,
                  boxShadow: isSelected ? `0 0 0 1px ${PRIMARY}33, 0 4px 16px rgba(108,71,255,0.2)` : "none",
                }}
              >
                <div
                  className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center"
                  style={{
                    border: `2px solid ${isSelected ? PRIMARY : BORDER}`,
                    background: isSelected ? PRIMARY : "transparent",
                  }}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-2xl">{g.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold" style={{ color: isSelected ? "#fff" : FG }}>
                      {g.words}
                    </span>
                    <span className="text-sm font-medium" style={{ color: isSelected ? "#fff" : FG }}>
                      слов
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.65)" : MUTED }}>
                    {g.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-full px-6 pb-12 flex flex-col items-center gap-5 pt-5">
        <div className="flex items-center gap-1.5">
          <Dot active={false} />
          <Dot active={false} />
          <Dot active={false} />
          <Dot active={true} />
        </div>
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl border-0 tracking-wide"
          style={{ background: PRIMARY, boxShadow: `0 8px 24px rgba(108,71,255,0.4)` }}
          onClick={() => onComplete(selected)}
        >
          Начать обучение
        </Button>
      </div>
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState(0);

  const next = () => setScreen((s) => Math.min(s + 1, totalScreens - 1));

  return (
    <div
      className="w-full h-dvh flex justify-center overflow-hidden"
      style={{ background: BG, fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-md h-full flex flex-col relative">
        <StatusBar />
        {screen === 0 && <Screen1 onNext={next} />}
        {screen === 1 && <Screen2 onNext={next} />}
        {screen === 2 && <Screen3 onNext={next} />}
        {screen === 3 && <Screen4 onComplete={onComplete} />}
      </div>
    </div>
  );
}
