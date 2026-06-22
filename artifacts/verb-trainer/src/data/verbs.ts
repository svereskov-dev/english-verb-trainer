import { VerbBehavior, VerbTransitivity, VerbDomain } from "./grammar";

export interface Verb {
  infinitive: string;
  past: string;
  pastParticiple: string;
  frequencyRank: number;
  isIrregular: boolean;
  translation: string;
  behavior: VerbBehavior;
  transitivity: VerbTransitivity;
  domains: VerbDomain[];
}

// ─── Russian translations ────────────────────────────────────────────────────

const translations: Record<string, string> = {
  be: "быть", have: "иметь", do: "делать", say: "говорить", go: "идти",
  get: "получать", make: "делать", know: "знать", think: "думать",
  take: "брать", see: "видеть", come: "приходить", give: "давать",
  find: "находить", tell: "рассказывать", become: "становиться",
  leave: "уходить", feel: "чувствовать", put: "класть", bring: "приносить",
  begin: "начинать", keep: "хранить", hold: "держать", write: "писать",
  stand: "стоять", hear: "слышать", let: "позволять", meet: "встречать",
  lead: "вести", run: "бежать", set: "устанавливать", buy: "покупать",
  speak: "говорить", lose: "терять", pay: "платить", send: "отправлять",
  build: "строить", sit: "сидеть", fall: "падать", cut: "резать",
  read: "читать", spend: "тратить", sell: "продавать", understand: "понимать",
  break: "ломать", win: "побеждать", drive: "водить", eat: "есть",
  drink: "пить", rise: "подниматься", grow: "расти", draw: "рисовать",
  choose: "выбирать", throw: "бросать", catch: "ловить", teach: "преподавать",
  fly: "летать", forget: "забывать", swim: "плавать", sing: "петь",
  ride: "ездить", wear: "носить", wake: "просыпаться", shake: "трясти",
  steal: "красть", hide: "прятать", bite: "кусать", freeze: "замерзать",
  tear: "рвать", blow: "дуть", strike: "ударять", stick: "приклеивать",
  swing: "качать", dig: "копать", hang: "вешать", shoot: "стрелять",
  spin: "вращать", spread: "распространять", hurt: "причинять боль",
  hit: "ударять", cost: "стоить", shut: "закрывать", beat: "бить",
  lend: "одалживать", bend: "сгибать", mean: "означать", sweep: "подметать",
  sleep: "спать", creep: "красться", weep: "плакать", deal: "иметь дело",
  forbid: "запрещать", forgive: "прощать", withdraw: "снимать",
  withstand: "выдерживать", mislead: "вводить в заблуждение",
  overcome: "преодолевать", undergo: "проходить через", upset: "расстраивать",
  undo: "отменять", mistake: "ошибаться", ring: "звонить", sink: "тонуть",
  spring: "прыгать", shrink: "сжиматься", stink: "вонять", cling: "цепляться",
  fling: "бросать", sting: "жалить", slide: "скользить", stride: "шагать",
  kneel: "стоять на коленях", speed: "ускоряться", bleed: "кровоточить",
  breed: "разводить", feed: "кормить", flee: "убегать", shed: "сбрасывать",
  bid: "предлагать цену", rid: "избавляться", quit: "бросать", thrust: "толкать",
  cast: "бросать", burst: "взрываться",
  show: "показывать", die: "умирать", expect: "ожидать", kill: "убивать",
  remain: "оставаться", raise: "поднимать", hope: "надеяться", cause: "вызывать",
  place: "размещать", arrive: "прибывать", want: "хотеть", wish: "желать",
  matter: "иметь значение", exist: "существовать", avoid: "избегать",
  connect: "соединять", trust: "доверять", touch: "трогать", search: "искать",
  work: "работать", talk: "разговаривать", walk: "ходить", play: "играть",
  watch: "смотреть", listen: "слушать", open: "открывать", close: "закрывать",
  start: "начинать", stop: "останавливать", finish: "заканчивать",
  help: "помогать", ask: "спрашивать", answer: "отвечать", use: "использовать",
  move: "двигаться", turn: "поворачивать", learn: "изучать", explain: "объяснять",
  try: "пытаться", study: "учиться", practice: "практиковать", cook: "готовить",
  clean: "убирать", wash: "мыть", call: "звонить", wait: "ждать",
  live: "жить", love: "любить", like: "нравиться", hate: "ненавидеть",
  need: "нуждаться", plan: "планировать", check: "проверять", change: "изменять",
  join: "присоединяться", jump: "прыгать", kick: "пинать", laugh: "смеяться",
  smile: "улыбаться", cry: "плакать", push: "толкать", pull: "тянуть",
  save: "сохранять", serve: "обслуживать", share: "делиться", stay: "оставаться",
  travel: "путешествовать", visit: "посещать", develop: "развивать",
  include: "включать", allow: "позволять", consider: "рассматривать",
  suggest: "предлагать", accept: "принимать", report: "сообщать",
  require: "требовать", receive: "получать", provide: "предоставлять",
  create: "создавать", decide: "решать", improve: "улучшать",
  increase: "увеличивать", decrease: "уменьшать", manage: "управлять",
  measure: "измерять", reduce: "сокращать", involve: "вовлекать",
  compare: "сравнивать", describe: "описывать", produce: "производить",
  discuss: "обсуждать", continue: "продолжать", realize: "осознавать",
  recognize: "узнавать", remember: "помнить", imagine: "воображать",
  contain: "содержать", represent: "представлять", establish: "устанавливать",
  prefer: "предпочитать", intend: "намереваться", design: "проектировать",
  depend: "зависеть", belong: "принадлежать", achieve: "достигать",
  perform: "выполнять", determine: "определять", complete: "завершать",
  mention: "упоминать", obtain: "получать", support: "поддерживать",
  reach: "достигать", believe: "верить", agree: "соглашаться",
  disagree: "не соглашаться", appear: "появляться", disappear: "исчезать",
  happen: "происходить", fail: "терпеть неудачу", succeed: "добиться успеха",
  follow: "следовать", pass: "проходить", carry: "нести", add: "добавлять",
  return: "возвращать", offer: "предлагать", enter: "входить", form: "формировать",
  order: "заказывать", seem: "казаться", care: "заботиться", cover: "покрывать",
  wonder: "удивляться", worry: "беспокоиться", copy: "копировать",
  count: "считать", cross: "пересекать", damage: "повреждать",
  discover: "обнаруживать", download: "скачивать", drop: "ронять",
  encourage: "поощрять", enjoy: "наслаждаться", escape: "сбегать",
  experience: "переживать", explore: "исследовать", fix: "чинить",
  focus: "сосредотачиваться", gather: "собирать", guess: "угадывать",
  handle: "обращаться", identify: "определять", ignore: "игнорировать",
  impact: "влиять", install: "устанавливать", introduce: "представлять",
  issue: "выдавать", launch: "запускать", lift: "поднимать", link: "связывать",
  load: "загружать", lock: "запирать", log: "записывать", mark: "отмечать",
  match: "соответствовать", miss: "скучать", mix: "смешивать", name: "называть",
  notice: "замечать", observe: "наблюдать", own: "владеть", park: "парковать",
  pick: "выбирать", point: "указывать", post: "публиковать", prepare: "готовить",
  press: "нажимать", process: "обрабатывать", protect: "защищать",
  publish: "публиковать", record: "записывать", release: "выпускать",
  remove: "удалять", rent: "арендовать", repeat: "повторять", replace: "заменять",
  request: "просить", research: "исследовать", respond: "отвечать",
  review: "рассматривать", select: "выбирать", sign: "подписывать",
  skip: "пропускать", solve: "решать", sort: "сортировать", store: "хранить",
  subscribe: "подписываться", switch: "переключать", target: "нацеливаться",
  test: "тестировать", track: "отслеживать", transfer: "передавать",
  transform: "преобразовывать", translate: "переводить", type: "печатать",
  update: "обновлять", upload: "загружать", verify: "проверять",
  view: "просматривать", zip: "сжимать", zoom: "приближать",
};

// ─── Grammatical overrides (defaults: dynamic / ambitransitive / ["general"]) ─

const behaviorOverrides: Record<string, VerbBehavior> = {
  // Copular — require a complement (adjective/noun) in the frame
  be: "copular", become: "copular", seem: "copular", appear: "copular",
  // Stative — describe states; resist progressive tenses
  have: "stative", know: "stative", see: "stative", hear: "stative",
  understand: "stative", mean: "stative", cost: "stative", feel: "stative",
  like: "stative", love: "stative", hate: "stative", need: "stative",
  prefer: "stative", remember: "stative", believe: "stative",
  contain: "stative", belong: "stative", depend: "stative",
  require: "stative", involve: "stative", enjoy: "stative",
  own: "stative", wonder: "stative", care: "stative",
  represent: "stative", intend: "stative",
  // New stative additions
  expect: "stative", hope: "stative", want: "stative", wish: "stative",
  matter: "stative", exist: "stative", trust: "stative",
};

const transitivityOverrides: Record<string, VerbTransitivity> = {
  // Copular verbs: never take direct objects
  be: "intransitive", become: "intransitive", seem: "intransitive", appear: "intransitive",
  // Clearly intransitive dynamic/stative verbs
  go: "intransitive", come: "intransitive", run: "intransitive", swim: "intransitive",
  sleep: "intransitive", fall: "intransitive", sit: "intransitive", stand: "intransitive",
  rise: "intransitive", walk: "intransitive", talk: "intransitive", wait: "intransitive",
  live: "intransitive", stay: "intransitive", laugh: "intransitive", smile: "intransitive",
  speak: "intransitive", belong: "intransitive", depend: "intransitive",
  wonder: "intransitive", care: "intransitive", travel: "intransitive",
  cry: "intransitive", weep: "intransitive", creep: "intransitive",
  flee: "intransitive", sink: "intransitive", spring: "intransitive",
  shrink: "intransitive", stink: "intransitive", cling: "intransitive",
  slide: "intransitive", stride: "intransitive", kneel: "intransitive",
  speed: "intransitive", bleed: "intransitive", burst: "intransitive",
  work: "intransitive", listen: "intransitive", fail: "intransitive",
  succeed: "intransitive", agree: "intransitive", disagree: "intransitive",
  disappear: "intransitive", happen: "intransitive", arrive: "intransitive",
  subscribe: "intransitive", respond: "intransitive",
  // New intransitive additions
  die: "intransitive", remain: "intransitive", matter: "intransitive", exist: "intransitive",
};

const domainOverrides: Record<string, VerbDomain[]> = {
  // Motion
  go: ["motion"], come: ["motion"], travel: ["motion"], walk: ["motion"],
  run: ["motion"], fly: ["motion"], drive: ["motion"], ride: ["motion"],
  move: ["motion"], return: ["motion"], enter: ["motion"], leave: ["motion"],
  bring: ["motion"], send: ["motion"], creep: ["motion"], flee: ["motion"],
  sink: ["motion"], spring: ["motion"], slide: ["motion"], stride: ["motion"],
  speed: ["motion"], cross: ["motion"], reach: ["motion"], park: ["motion"],
  escape: ["motion"], zoom: ["motion"], withdraw: ["motion"], arrive: ["motion"],
  // Creation
  write: ["creation", "communication"], build: ["creation"], make: ["creation"],
  design: ["creation"], draw: ["creation"], cook: ["creation"],
  create: ["creation"], produce: ["creation"], develop: ["creation", "change"],
  publish: ["creation"], record: ["creation"], form: ["creation"],
  type: ["creation"],
  // Communication
  say: ["communication"], tell: ["communication"], speak: ["communication"],
  ask: ["communication"], explain: ["communication"], call: ["communication"],
  describe: ["communication"], mention: ["communication"], repeat: ["communication"],
  answer: ["communication"], report: ["communication"], translate: ["communication"],
  discuss: ["communication"], introduce: ["communication"], name: ["communication"],
  post: ["communication"], respond: ["communication"], suggest: ["communication"],
  show: ["communication"],
  // Mental
  know: ["mental"], think: ["mental"], understand: ["mental"],
  believe: ["mental"], remember: ["mental"], imagine: ["mental"],
  realize: ["mental"], recognize: ["mental"], forget: ["mental"],
  learn: ["mental"], study: ["mental"], consider: ["mental"],
  decide: ["mental"], compare: ["mental"], discover: ["mental"],
  identify: ["mental"], observe: ["mental"], notice: ["mental"],
  research: ["mental"], solve: ["mental"], guess: ["mental"],
  determine: ["mental"], review: ["mental"],
  expect: ["mental"], hope: ["mental"], want: ["mental"], wish: ["mental"],
  search: ["mental"],
  // Consumption
  eat: ["consumption"], drink: ["consumption"], buy: ["consumption"],
  use: ["consumption"], spend: ["consumption"], read: ["consumption"],
  watch: ["consumption"], view: ["consumption"],
  // Physical
  hit: ["physical"], break: ["physical"], cut: ["physical"],
  push: ["physical"], pull: ["physical"], carry: ["physical"],
  lift: ["physical"], throw: ["physical"], catch: ["physical"],
  kick: ["physical"], beat: ["physical"], bite: ["physical"],
  shake: ["physical"], clean: ["physical"], wash: ["physical"],
  fix: ["physical"], handle: ["physical"], mix: ["physical"],
  press: ["physical"], remove: ["physical"], drop: ["physical"],
  damage: ["physical"], cover: ["physical"], tear: ["physical"],
  blow: ["physical"], strike: ["physical"], stick: ["physical"],
  swing: ["physical"], dig: ["physical"], hang: ["physical"],
  shoot: ["physical"], spin: ["physical"], hurt: ["physical"],
  fling: ["physical"], sting: ["physical"], thrust: ["physical"],
  cast: ["physical"], jump: ["physical"], kneel: ["physical"],
  bleed: ["physical"], kill: ["physical"], place: ["physical"], touch: ["physical"],
  // Social
  meet: ["social"], help: ["social"], visit: ["social"], join: ["social"],
  share: ["social"], play: ["social"], laugh: ["social"], sing: ["social"],
  teach: ["social"], give: ["social"], serve: ["social"], lend: ["social"],
  forgive: ["social"], forbid: ["social"], encourage: ["social"],
  gather: ["social"], support: ["social"], trust: ["social"],
  // Change
  become: ["change"], grow: ["change"], improve: ["change"],
  increase: ["change"], decrease: ["change"], change: ["change"], reduce: ["change"],
  transform: ["change"], shrink: ["change"], disappear: ["change"],
  rise: ["change"], get: ["change"],
};

// ─── Irregular verb list ─────────────────────────────────────────────────────

const irregularList = [
  "be/was/were/been", "have/had/had", "do/did/done", "say/said/said", "go/went/gone",
  "get/got/gotten", "make/made/made", "know/knew/known", "think/thought/thought",
  "take/took/taken", "see/saw/seen", "come/came/come", "give/gave/given",
  "find/found/found", "tell/told/told", "become/became/become", "leave/left/left",
  "feel/felt/felt", "put/put/put", "bring/brought/brought", "begin/began/begun",
  "keep/kept/kept", "hold/held/held", "write/wrote/written", "stand/stood/stood",
  "hear/heard/heard", "show/showed/shown", "let/let/let", "meet/met/met", "lead/led/led", "run/ran/run",
  "set/set/set", "buy/bought/bought", "speak/spoke/spoken", "lose/lost/lost",
  "pay/paid/paid", "send/sent/sent", "build/built/built", "sit/sat/sat",
  "fall/fell/fallen", "cut/cut/cut", "read/read/read", "spend/spent/spent",
  "sell/sold/sold", "understand/understood/understood", "break/broke/broken",
  "win/won/won", "drive/drove/driven", "eat/ate/eaten", "drink/drank/drunk",
  "rise/rose/risen", "grow/grew/grown", "draw/drew/drawn", "choose/chose/chosen",
  "throw/threw/thrown", "catch/caught/caught", "teach/taught/taught", "fly/flew/flown",
  "forget/forgot/forgotten", "swim/swam/swum", "sing/sang/sung", "ride/rode/ridden",
  "wear/wore/worn", "wake/woke/woken", "shake/shook/shaken", "steal/stole/stolen",
  "hide/hid/hidden", "bite/bit/bitten", "freeze/froze/frozen", "tear/tore/torn",
  "blow/blew/blown", "strike/struck/struck", "stick/stuck/stuck", "swing/swung/swung",
  "dig/dug/dug", "hang/hung/hung", "shoot/shot/shot", "spin/spun/spun",
  "spread/spread/spread", "hurt/hurt/hurt", "hit/hit/hit", "cost/cost/cost",
  "shut/shut/shut", "beat/beat/beaten", "lend/lent/lent", "bend/bent/bent",
  "mean/meant/meant", "sweep/swept/swept", "sleep/slept/slept", "creep/crept/crept",
  "weep/wept/wept", "deal/dealt/dealt", "forbid/forbade/forbidden",
  "forgive/forgave/forgiven", "withdraw/withdrew/withdrawn",
  "withstand/withstood/withstood", "mislead/misled/misled",
  "overcome/overcame/overcome", "undergo/underwent/undergone", "upset/upset/upset",
  "undo/undid/undone", "mistake/mistook/mistaken", "ring/rang/rung",
  "sink/sank/sunk", "spring/sprang/sprung", "shrink/shrank/shrunk",
  "stink/stank/stunk", "cling/clung/clung", "fling/flung/flung", "sting/stung/stung",
  "slide/slid/slid", "stride/strode/stridden", "kneel/knelt/knelt", "speed/sped/sped",
  "bleed/bled/bled", "breed/bred/bred", "feed/fed/fed", "flee/fled/fled",
  "shed/shed/shed", "bid/bid/bid", "rid/rid/rid", "quit/quit/quit",
  "thrust/thrust/thrust", "cast/cast/cast", "burst/burst/burst",
];

// ─── Regular verb list ───────────────────────────────────────────────────────

const regularList = [
  "work", "talk", "walk", "play", "watch", "listen", "open", "close", "start",
  "stop", "finish", "help", "ask", "answer", "use", "move", "turn", "learn",
  "explain", "try", "study", "practice", "cook", "clean", "wash", "call", "wait",
  "live", "love", "like", "hate", "need", "plan", "check", "change", "join",
  "jump", "kick", "laugh", "smile", "cry", "push", "pull", "save", "serve",
  "share", "stay",
  "die", "want", "wish", "hope", "expect",
  "kill", "remain", "raise", "cause", "place", "arrive",
  "matter", "exist", "trust", "touch", "avoid", "connect", "search",
  "travel", "visit", "develop", "include", "allow", "consider",
  "suggest", "accept", "report", "require", "receive", "provide", "create",
  "decide", "improve", "increase", "decrease", "manage", "measure", "reduce",
  "involve", "compare", "describe", "produce", "discuss", "continue", "realize",
  "recognize", "remember", "imagine", "contain", "represent", "establish",
  "prefer", "intend", "design", "depend", "belong", "achieve", "perform",
  "determine", "complete", "mention", "obtain", "support", "reach", "believe",
  "agree", "disagree", "appear", "disappear", "happen", "fail", "succeed",
  "follow", "pass", "carry", "add", "return", "offer", "enter", "form", "order",
  "seem", "care", "cover", "wonder", "worry", "copy", "count", "cross",
  "damage", "discover", "download", "drop", "encourage", "enjoy", "escape",
  "experience", "explore", "fix", "focus", "gather", "guess", "handle",
  "identify", "ignore", "impact", "install", "introduce", "issue", "launch",
  "lift", "link", "load", "lock", "log", "mark", "match", "miss", "mix", "name",
  "notice", "observe", "own", "park", "pick", "point", "post", "prepare", "press",
  "process", "protect", "publish", "record", "release", "remove", "rent",
  "repeat", "replace", "request", "research", "respond", "review", "select",
  "sign", "skip", "solve", "sort", "store", "subscribe", "switch", "target",
  "test", "track", "transfer", "transform", "translate", "type", "update",
  "upload", "verify", "view", "zip", "zoom",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCVC(word: string): boolean {
  if (word.length < 3) return false;
  const vowels = "aeiou";
  const w = word.toLowerCase();
  const c1 = w[w.length - 3];
  const v  = w[w.length - 2];
  const c2 = w[w.length - 1];
  return (
    !vowels.includes(c1) &&
    vowels.includes(v) &&
    !vowels.includes(c2) &&
    c2 !== "w" && c2 !== "x" && c2 !== "y"
  );
}

function getRegularPast(infinitive: string): string {
  const w = infinitive.toLowerCase();
  if (w.endsWith("e")) return w + "d";
  if (w.endsWith("y")) {
    const vowels = "aeiou";
    if (!vowels.includes(w[w.length - 2])) return w.slice(0, -1) + "ied";
  }
  if (isCVC(w)) return w + w[w.length - 1] + "ed";
  return w + "ed";
}

function tagsFor(infinitive: string): Pick<Verb, "behavior" | "transitivity" | "domains"> {
  return {
    behavior:     behaviorOverrides[infinitive]    ?? "dynamic",
    transitivity: transitivityOverrides[infinitive] ?? "ambitransitive",
    domains:      domainOverrides[infinitive]       ?? ["general"],
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

let currentRank = 1;

export const irregularVerbs: Verb[] = irregularList.map(item => {
  const parts = item.split("/");
  const infinitive = parts[0];
  let past = parts[1];
  const pastParticiple = parts[2];
  if (infinitive === "be") past = "was/were";

  return {
    infinitive,
    past,
    pastParticiple,
    frequencyRank: currentRank++,
    isIrregular: true,
    translation: translations[infinitive] ?? "",
    ...tagsFor(infinitive),
  };
});

export const regularVerbs: Verb[] = regularList.map(infinitive => {
  const past = getRegularPast(infinitive);
  return {
    infinitive,
    past,
    pastParticiple: past,
    frequencyRank: currentRank++,
    isIrregular: false,
    translation: translations[infinitive] ?? "",
    ...tagsFor(infinitive),
  };
});

export const verbs: Verb[] = [...irregularVerbs, ...regularVerbs];
