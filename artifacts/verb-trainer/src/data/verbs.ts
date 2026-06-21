export interface Verb {
  infinitive: string;
  past: string;
  pastParticiple: string;
  frequencyRank: number;
  isIrregular: boolean;
}

const irregularList = [
  "be/was/were/been", "have/had/had", "do/did/done", "say/said/said", "go/went/gone",
  "get/got/gotten", "make/made/made", "know/knew/known", "think/thought/thought",
  "take/took/taken", "see/saw/seen", "come/came/come", "give/gave/given",
  "find/found/found", "tell/told/told", "become/became/become", "leave/left/left",
  "feel/felt/felt", "put/put/put", "bring/brought/brought", "begin/began/begun",
  "keep/kept/kept", "hold/held/held", "write/wrote/written", "stand/stood/stood",
  "hear/heard/heard", "let/let/let", "meet/met/met", "lead/led/led", "run/ran/run",
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
  "thrust/thrust/thrust", "cast/cast/cast", "burst/burst/burst"
];

const regularList = [
  "work", "talk", "walk", "play", "watch", "listen", "open", "close", "start",
  "stop", "finish", "help", "ask", "answer", "use", "move", "turn", "learn",
  "explain", "try", "study", "practice", "cook", "clean", "wash", "call", "wait",
  "live", "love", "like", "hate", "need", "plan", "check", "change", "join",
  "jump", "kick", "laugh", "smile", "cry", "push", "pull", "save", "serve",
  "share", "stay", "travel", "visit", "develop", "include", "allow", "consider",
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
  "upload", "verify", "view", "zip", "zoom"
];

function isCVC(word: string): boolean {
  if (word.length < 3) return false;
  const vowels = "aeiou";
  const w = word.toLowerCase();
  const c1 = w[w.length - 3];
  const v = w[w.length - 2];
  const c2 = w[w.length - 1];
  if (!vowels.includes(c1) && vowels.includes(v) && !vowels.includes(c2) && c2 !== 'w' && c2 !== 'x' && c2 !== 'y') {
    return true;
  }
  return false;
}

function getRegularPast(infinitive: string): string {
  const w = infinitive.toLowerCase();
  if (w.endsWith("e")) return w + "d";
  if (w.endsWith("y")) {
    const vowels = "aeiou";
    if (!vowels.includes(w[w.length - 2])) {
      return w.slice(0, -1) + "ied";
    }
  }
  if (isCVC(w)) {
    return w + w[w.length - 1] + "ed";
  }
  return w + "ed";
}

let currentRank = 1;

export const irregularVerbs: Verb[] = irregularList.map(item => {
  const parts = item.split("/");
  const infinitive = parts[0];
  let past = parts[1];
  let pastParticiple = parts[2];
  
  if (infinitive === "be") {
    past = "was/were";
  }
  
  return {
    infinitive,
    past,
    pastParticiple,
    frequencyRank: currentRank++,
    isIrregular: true
  };
});

export const regularVerbs: Verb[] = regularList.map(infinitive => {
  const past = getRegularPast(infinitive);
  return {
    infinitive,
    past,
    pastParticiple: past,
    frequencyRank: currentRank++,
    isIrregular: false
  };
});

export const verbs: Verb[] = [...irregularVerbs, ...regularVerbs];
