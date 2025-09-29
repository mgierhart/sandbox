/**
 * Tessa Dawnspark — Cozy Romcom (Slice-of-Life) — MUTUAL DISCOVERY — MAXI+++ (No-Autoplay + Guarded + Stale-Clue Reset)
 * Standalone JanitorAI Advanced Script (NO Basic/UI scripts, NO Lorebary required)
 */

const CONF = {
  botName: "Tessa Dawnspark",
  style: { minSentences: 6, maxSentences: 10, oneRevealPerReply: true, softHook: true, perTurnInjectionCap: 4, cooldownMs: 1500 },
  cooldowns: { quip: 800, npc: 1200, microTask: 900, comfort: 1200, reveal: 1000 },
  debug: { PRINT_FIRED_CLUE: false, PRINT_INTENT: false },

  canon: {
    rivalryMode: "HOUSE_WAR",
    houses: {
      tessa: { name: "House Velaryn", blurb: "river-trade; ferry rights along the Greenway", crest: "silver heron" },
      user:  { name: "House Coldmere", blurb: "highland iron & timber; pass control",      crest: "black pine" }
    },
    accord: "Flintford Accord",
    rank: "B-Rank",
    town: {
      name: "Rivermarch",
      flavor: [
        "A Greenway bend with a three-arch stone bridge",
        "Quay markets stacked with riverfruit and scrap-iron charms",
        "Flood markers notched into the quay posts",
        "A bell-tower whose note carries at dawn",
        "Narrow lanes that smell of riverfruit and forge smoke",
        "Ledger boards nailed above doorways when the river rises"
      ]
    },
    home: {
      name: "Lantern Lane Rowhouse",
      description: "Two-story brick rowhouse; mint planter; upstairs bedroom; a small extra room set for a child.",
      notes: "Guild hall is across the square. No NPC intrusions unless you visit the guild or ask for them."
    },
    timeskip: {
      key: "DAWNVAULT_X_ECHORETURN",
      horizonYears: 6, // discoverable only
      spells: {
        tessa: { name: "Dawnvault Aegis",  note: "duel variant deferring verdict to a fixed horizon" },
        user:  { name: "Echo-Return Seal", note: "rewinds self on decisive strike (marked opponent clause)" }
      }
    },
    nerys: {
      relation: "daughter",
      ageYears: 4,
      species: "dragonet (dragon-kin child)",
      appearance: { hair: "red, like her mother", eyes: "like {user}", wings: "royal blue", horns: "none" },
      temperament: "sweet, energetic; idolizes her mother; loves her father",
      likes: ["when Tessa does tricks with fire"],
      usualLocation: "asleep in her own room at home"
    }
  },

  symbols: { rings: { engraving: "Tessa ⊕ {user} · Adventurer’s Guild Crest", warmAtDawn: true, coolAtSunset: true } },
  quirks: { praiseFluster: true, virtueModestyArc: true },
  gating: { nerysKeywords: ["kid","kids","child","children","daughter","son","nerys"] }
};

// -------- NPCS --------
const NPCS = {
  marla: {
    key: "marla", name: "Marla", aliases: ["maria","clerk","guild clerk","front desk"],
    role: "Guild Clerk", voice: "brisk, cheerful",
    intro: `*At the **guild hall**, the clerk looks up from a ledger.* "There you are. The board’s ready when you are."`,
    lines: [
      () => `Marla taps a column. "Roster lists **${CONF.canon.rank}** for both of you."`,
      () => `"Directive: '**Open new chapter—${CONF.canon.town.name}**; interim **co-Guild Masters**.'"`,
      () => `"Addendum cites the **${CONF.canon.accord}**—houses hands off; guild enforcement."`
    ],
    helpsWith: ["paperwork","board","calendar"],
    applyClues: S => { S.clueBRank = true; S.clueCoGuildMasters = true; S.clueChapterOpen = true; if(!S.clueAccordFlintford) S.clueAccordFlintford = true; }
  },
  den: {
    key: "den", name: "Den", aliases: ["quartermaster","armorer","store","supplies"],
    role: "Quartermaster", voice: "deadpan",
    intro: `*At the **guild store**, a broad-shouldered man slides a crate across the counter.* "Your sizes haven't changed. Much."`,
    lines: [
      () => `Den taps a tag. "Order notes show **${CONF.canon.rank}** requisitions."`,
      () => `"Keys labeled 'Chapter: ${CONF.canon.town.name}'—looks like you two signed for them."`
    ],
    helpsWith: ["gear","supplies"],
    applyClues: S => { S.clueBRank = true; S.clueChapterOpen = true; }
  }
};

// -------- STATE --------
const S = {
  turn: 0,
  mode: "shock",
  lastTs: 0, injections: 0, reveals: 0,
  coopStreak: 0, objectionTurn: -1,
  lastCatTs: { quip:0, npc:0, microTask:0, comfort:0, reveal:0 },

  nerysUnlocked: false, clueNerysKnown: false,
  userPlan: null,

  ringNoticed:false, ringRead:false,
  journalsSeen:true, journalReadOnce:false,
  checklistDoneOnce:false, placeRevisited:false, windowChecked:false,
  npcMet: { marla:false, den:false },

  // Clues
  clueGuildCrestOnRings:false,
  clueCoGuildMasters:false,
  clueBRank:false,
  clueChapterOpen:false,
  clueHouseWarVelarynColdmere:false,
  clueAccordFlintford:false,
  clueTimeskipMechanism:false,
  clueSixYears:false,
  clueTownBasics:false,

  // Journal sequence tracker
  journalStep: 0,

  // Allowlist for this-turn reveals (extra strict guard)
  allowThisTurn: { sixYears:false },

  lastClue:null, lastIntent:null
};

// -------- UTILS --------
function now(){ return Date.now(); }
function applyCooldown(){ const t=now(); if(t - S.lastTs < CONF.style.cooldownMs) return; S.lastTs=t; S.injections=0; S.reveals=0; S.allowThisTurn={sixYears:false}; } // FIX: reset allowlist each turn
function canInject(){ return S.injections < CONF.style.perTurnInjectionCap; }
function inject(s){ if(!canInject()) return ""; S.injections++; return s; }
function canFire(cat){ const t=now(); return (t - S.lastCatTs[cat]) >= CONF.cooldowns[cat]; }
function markFire(cat){ S.lastCatTs[cat]=now(); }
function capSentences(t,mi,ma){
  let parts = t.split(/(?<=["”'’]?[.!?])\s+/).filter(Boolean);
  if (!parts.length) return t;
  const hook = parts.pop();
  while ((parts.length + 1) < mi) parts.push("We keep to one calm step and breathe together.");
  if ((parts.length + 1) > ma) parts = parts.slice(0, Math.max(0, ma - 1));
  parts.push(hook);
  return parts.join(" ");
}
function ensureRPFormat(text){
  let out=text;
  if(!/(^| )".+?"/.test(out)) out = `"Don’t you dare stall." `+out;
  if(!/\*.+\*/.test(out)) out += ` *She tightens the sheet with one elbow, pillow raised.*`;
  if(!/`.+`/.test(out)) out += ` \`One fact at a time—no assumptions.\``;
  return out;
}
function wbRegex(words){ return new RegExp(`\\b(${words.map(w=>w.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")).join("|")})\\b`,"i"); }
function isCoop(u){ return /\b(let(?:'s)?|together|team up|we can|sorry|apologize|my fault|i forgive|i'm sorry|truce)\b/i.test(u); }
function checkNerysUnlock(u){ if(S.nerysUnlocked) return; if(wbRegex(CONF.gating.nerysKeywords).test(u)) S.nerysUnlocked=true; }
function markClue(label){ S.lastClue=label; return CONF.debug.PRINT_FIRED_CLUE ? ` [${label}]` : ""; }
function rxEsc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// -------- GUARDS --------
const RX_SIX = /\b(six\s+winters?|6\s+years?|six\s+years?)\b/gi; // FIX: centralize
function guardOutput(text, intent){
  let out = text;

  // FIX: Stale-clue hard reset — if six-years is somehow true pre-sequence, revoke it
  if (S.clueSixYears && S.journalStep < 3) S.clueSixYears = false;

  // Strict six-years gate: only show if journal step 3 just fired OR the clue is legitimately unlocked
  const allowSixNow = S.allowThisTurn.sixYears || S.clueSixYears;
  if (!allowSixNow) out = out.replace(RX_SIX, "the missing years");

  // Other specifics
  if(!S.clueAccordFlintford) out = out.replace(new RegExp(`\\b(${rxEsc(CONF.canon.accord)})\\b`,'gi'), "that later agreement");
  if(!S.clueCoGuildMasters)  out = out.replace(/\b(co-?guild\s+masters?|guild\s+masters?|assigned\s+to\s+open\s+a\s+chapter)\b/gi, "some kind of guild role");
  if(!S.clueTownBasics)      out = out.replace(new RegExp(`\\b(${rxEsc(CONF.canon.town.name)})\\b`,'gi'), "this town");

  // Speculation dampener outside investigate
  if (S.mode !== "investigate") {
    out = out.replace(/\b(must have|must've)\b/gi, "might")
             .replace(/\bsomeone\s+left\s+them\s+for\s+us\b/gi, "they were left here")
             .replace(/\bwe\s+left\s+them\s+for\s+ourselves\b/gi, "they were left here (we can verify)")
             .replace(/\bit\s+(?:was|is)\s+(?:obvious|clear)\b/gi, "it seems");
  }
  // Even in investigate, avoid attributing agents until mechanism revealed
  if (!S.clueTimeskipMechanism) {
    out = out.replace(/\b(we\s+left\s+them\s+for\s+ourselves|someone\s+left\s+them\s+for\s+us)\b/gi, "they’re here for us to read");
  }
  return out;
}

// -------- NO-AUTOPLAY SENTRY --------
const ACT_VERB_RX = /\b(read|open|flip|check|look(?:\s+at|\s+to)?|glanc(?:e|es|ing)(?:\s+at)?|inspect|investigate|examine|scan|page|aloud|touch|feel|trace|twist|rotate|rub)\b/i;
const TOPIC_RX = {
  rings: /\b(ring|engraving|band)\b/i,
  journal: /\b(journal|entry|page|bookmark)\b/i,
  board: /\b(board|roster|posting|notice|directive|writ|stamp)\b/i
};
function sentenceAllows(topic, intent){
  if (S.mode==="shock") return false;
  if (S.mode==="settle" && topic!=="rings") return false;
  return intent === topic;
}
function sanitizeAutoplay(text, intent){
  const sentences = text.split(/(?<=["”'’]?[.!?])\s+/).filter(Boolean);
  const rewritten = sentences.map(s=>{
    const hasVerb = ACT_VERB_RX.test(s);
    const touches = { rings: TOPIC_RX.rings.test(s), journal: TOPIC_RX.journal.test(s), board: TOPIC_RX.board.test(s) };
    if (hasVerb && ((touches.rings && !sentenceAllows("rings", intent)) ||
                    (touches.journal && !sentenceAllows("journal", intent)) ||
                    (touches.board && !sentenceAllows("board", intent)))){
      return s
        .replace(/\b(grabs?|snatches?|opens?|flips?|reads?|checks?|inspects?|investigates?|examines?|scans?|touches?|traces?|twists?|rotates?|rubs?)\b/ig, "could")
        .replace(/\b(the\s+)?(journal|ring|board|roster|page|bookmark)\b/ig, "$2—if you want");
    }
    return s;
  });
  return rewritten.join(" ");
}

// -------- PLAN / HOOKS --------
function updateUserPlan(usr){
  const t = usr.toLowerCase();
  if ((/\b(journal|entry|page)\b/.test(t)) && ACT_VERB_RX.test(t)) S.userPlan = "journal";
  else if (/\b(board|guild|checklist|posting|notice|errands|guild hall)\b/.test(t)) S.userPlan = "board";
  else if (/\b(window|outside|view|quay|bridge|market|rivermarch|street)\b/.test(t)) S.userPlan = "view";
  else if (/\b(marla|maria|clerk|den|quartermaster|armorer)\b/.test(t)) S.userPlan = "npc";
  else if (/\b(bed(room)?|stay here|sit|in bed|up here|this room|pillow|calm|breathe)\b/.test(t)) S.userPlan = "settle";
}
function hookShock(){
  const h = [
    "Breathe with me—four counts in, four out.",
    "Sheet first. Then a breath. Then a word.",
    "Do you want the kettle on? Mint helps.",
    "I won’t move if you don’t. One breath, then decide."
  ]; return h[Math.floor(Math.random()*h.length)];
}
function hookSettle(){
  const h = [
    "We can stay right here. Tea, or just breathe?",
    "No rushing. Do you want to sit back or check the window light?",
    "Hand me the pillow—just to rest, not to swing. Then one small step."
  ]; return h[Math.floor(Math.random()*h.length)];
}
function softHook(){
  if (S.mode==="shock") return hookShock();
  if (S.mode==="settle") return hookSettle();
  if (S.userPlan === "journal" || (!S.userPlan && !S.journalReadOnce)) {
    const h = [
      "Journal: title page, the latest dated line, or the margin scrawl?",
      "Stay put—ring text or a single journal line?",
      "One clue only: ring, journal line, or the window?"
    ]; return h[Math.floor(Math.random()*h.length)];
  }
  if (S.userPlan === "board") {
    const h = [
      "Guild hall then—roster, directives, or the stamp drawer?",
      "At the board, postings or rules first?",
      "When we head over, which section first?"
    ]; return h[Math.floor(Math.random()*h.length)];
  }
  const n = [
    "Ring text, one journal line, or a breath at the window?",
    "Small step here at home: rings, journals, or the view?",
    "Tea later—which clue in this room?"
  ]; return n[Math.floor(Math.random()*n.length)];
}

// -------- INTENT ROUTER --------
function detectIntent(u){
  const t = u.toLowerCase();
  if (ACT_VERB_RX.test(t) && /\b(ring|engraving|band)\b/.test(t)) return "rings";
  if (ACT_VERB_RX.test(t) && /\b(journal|entry|page)\b/.test(t)) return "journal";
  if (/\b(board|guild|checklist|errand|stamp|writ|roster|posting|notice)\b/.test(t)) return "board";
  if (/\b(outside|window|open the window|look out|town|street|rivermarch|quay|bridge|market)\b/.test(t)) return "view";
  if (/\b(marla|maria|clerk|front desk)\b/.test(t))  return "npc_marla";
  if (/\b(den|quartermaster|armorer|store|supplies)\b/.test(t)) return "npc_den";
  if (/\b(tea|kettle|brew|mint)\b/.test(t)) return "tea";
  if (/\b(errand|task|job|posting)\b/.test(t)) return "errand";
  if (/\b(kiss|cuddle|hug|touch|hold hands|handhold|intimate|close)\b/.test(t)) return "affection";
  if (/\b(dawnvault\s*aegis|echo[-\s]?return\s*seal|aegis|echo[-\s]?return)\b/.test(t)) return "spells";
  if (wbRegex(CONF.gating.nerysKeywords).test(t)) return "nerys";
  if (isCoop(t)) return "cooperate";
  return "neutral";
}

// -------- REVEAL GATES --------
function gateRevealFor(topic){
  if (CONF.style.oneRevealPerReply && S.reveals >= 1) return false;
  if (S.mode === "investigate") { S.reveals++; markFire("reveal"); return true; }
  if (S.mode === "settle") {
    if (topic === "rings") { S.reveals++; markFire("reveal"); return true; }
    if (topic === "nerys") { S.reveals++; markFire("reveal"); return true; }
  }
  return false;
}

// -------- REVEAL HANDLERS --------
function handleRings(){
  if (!S.ringRead && gateRevealFor("rings") && canInject()){
    S.ringRead = true; S.ringNoticed = true; S.clueGuildCrestOnRings = true;
    return inject(`*She squints at the band.* "That's the **Adventurer’s Guild** crest—and our names. Not a house seal."` + markClue("ring-crest"));
  } return "";
}
function handleJournal(){
  if (!canInject()) return "";
  if (!gateRevealFor("journal")) return "";

  S.journalReadOnce = true;
  let out = "";

  if (S.journalStep === 0){
    S.clueHouseWarVelarynColdmere = true; S.journalStep = 1;
    out = `*She cracks the journal a finger-width.* "Crests: ${CONF.canon.houses.tessa.crest} and ${CONF.canon.houses.user.crest}; escort writs and pass embargoes… opposite sides."` + markClue("house-war");
  } else if (S.journalStep === 1){
    S.clueTimeskipMechanism = true; S.journalStep = 2;
    out = `"Margin note: '**${CONF.canon.timeskip.spells.tessa.name}** held the verdict; '**${CONF.canon.timeskip.spells.user.name}** tried to undo it.' That's my handwriting?"` + markClue("timeskip-spells");
  } else if (S.journalStep === 2){
    S.clueSixYears = true; S.journalStep = 3; S.allowThisTurn.sixYears = true; // FIX: allow phrase ONLY this turn explicitly
    out = `"Dates jump—then resume **six winters** later. We… lived a lot."` + markClue("six-years");
  } else {
    if (!S.clueCoGuildMasters){ S.clueCoGuildMasters = true; S.clueBRank = true; S.clueChapterOpen = true; }
    S.journalStep = 4;
    out = `"Here: '**${CONF.canon.rank} achieved; assigned to **open a chapter** as co-masters—${CONF.canon.town.name}**.' That's… us."` + markClue("rank+chapter");
  }
  return inject(out);
}
function handleBoard(){
  if (!S.checklistDoneOnce && gateRevealFor("board") && canInject()){
    S.checklistDoneOnce = true; S.clueCoGuildMasters = true; S.clueBRank = true; S.clueChapterOpen = true;
    const out = [];
    out.push(`*She runs a finger down the roster.* "Listing… **${CONF.canon.rank}**—both of us."`);
    out.push(`"Directive: '**Open new chapter—${CONF.canon.town.name}**; interim **co-Guild Masters**.'"`);
    if (!S.clueAccordFlintford){ S.clueAccordFlintford = true; out.push(`"Addendum cites the **${CONF.canon.accord}**—houses hands off; guild enforcement."`); }
    return inject(out.join(" ") + markClue("board-rank+chapter+accord"));
  } return "";
}
function handleView(){
  if (!S.windowChecked && gateRevealFor("view") && canInject()){
    S.windowChecked = true; S.clueTownBasics = true;
    const f = CONF.canon.town.flavor; const pick = f[Math.floor(Math.random()*f.length)];
    return inject(`*She peels the curtain.* "${pick}. That’s **${CONF.canon.town.name}**."` + markClue("town-basics"));
  } return "";
}
function handleNerysIntro(){
  if (!S.nerysUnlocked || S.clueNerysKnown) return "";
  if (!gateRevealFor("nerys") || !canInject()) return "";
  S.clueNerysKnown = true;
  const n = CONF.canon.nerys;
  return inject(
    `*She finds a tucked scrap by the ribbon and stills.* "Here—**Nerys**." ` +
    `"Our ${n.relation}," she reads, steadying. "About ${n.ageYears}, a **${n.species}**—red hair like mine, ${n.appearance.eyes}, ` +
    `**${n.appearance.wings}** wings, and ${n.appearance.horns}." ` +
    `"It notes she’s ${n.temperament}, and she laughs when I do fire tricks." ` +
    `*A slow breath.* "She should be asleep in **her own room**—here, at **${CONF.canon.home.name}**. We can check **when you want**, quietly."`
  ) + markClue("nerys-intro");
}
function handleNPC(key){
  if (!canFire("npc")) return "";
  const npc = key==="marla"?NPCS.marla:NPCS.den;
  if (npc.key==="marla" && S.npcMet.marla) return inject(`*She considers.* "If we need paper proof, **Marla** can pull it—at the guild."` + markClue("npc-marla-repeat"));
  if (npc.key==="den" && S.npcMet.den)     return inject(`"Or **Den** can confirm supply logs—when we stop by the store."` + markClue("npc-den-repeat"));
  if (gateRevealFor("npc") && canInject()){
    const lines = [npc.intro].concat(npc.lines.map(fn=>fn()));
    npc.applyClues(S);
    if (npc.key==="marla") S.npcMet.marla = true; else S.npcMet.den = true;
    return inject(lines.join(" ") + markClue(`npc-${npc.key}-intro`));
  } return "";
}
function handleTea(){ if (!canFire("microTask")) return ""; markFire("microTask"); return inject(`*She reaches for the kettle, steadier now.* "Mint or plain?"`); }
function handleErrand(){ if (!canFire("microTask")) return ""; markFire("microTask"); return inject(`*She sets aside a blank posting.* "One small job later—**when we’re ready**."`); }
function handleSpellsTalk(){
  if (!S.clueTimeskipMechanism){
    return inject(`*She wets her lip, nodding once.* "Names, yes—${CONF.canon.timeskip.spells.tessa.name} and your ${CONF.canon.timeskip.spells.user.name}." ` +
                  `"But I’m not guessing what that means without text. One line in the journal, then we talk."`);
  }
  return inject(`"Right. The margin note matches what you said. We’ll keep to one proof at a time."`);
}
function microTaskPivot(){
  if (S.mode === "shock"){
    return "we keep the pillow up, breathe, and let the room stay exactly like this";
  }
  if (S.mode === "settle"){
    if (!S.ringRead || !S.clueGuildCrestOnRings){
      return "we stay on the bed and read the ring engraving together";
    }
    return "we hold position here and take one safe line from the journal when you’re ready";
  }

  if (!S.ringRead || !S.clueGuildCrestOnRings){
    return "we start with the rings—confirm the crest and names right here";
  }
  if (S.journalStep < 3){
    return "we crack the journal for a single line and see what it actually records";
  }
  if (!S.checklistDoneOnce || !S.clueChapterOpen || !S.clueCoGuildMasters){
    return "we walk to the guild board together only on paper—read the posting from here";
  }
  if (!S.windowChecked){
    return "we ease the curtain a finger-width and make sure it’s still Rivermarch outside";
  }
  return "we stay in this room and pick another proof that keeps us anchored";
}

// -------- PLANNER --------
function planReply(userText, turnIndex){
  applyCooldown();
  const usr = String(userText || "");
  S.turn = Math.max(S.turn, (typeof turnIndex==="number"?turnIndex:0));

  checkNerysUnlock(usr);
  updateUserPlan(usr);

  if (S.mode==="shock") {
    if (isCoop(usr) || ACT_VERB_RX.test(usr)) S.mode="settle";
  } else if (S.mode==="settle") {
    if (ACT_VERB_RX.test(usr)) S.mode="investigate";
  }

  let intent = detectIntent(usr);
  if (S.mode === "settle" && (intent === "rings" || intent === "journal" || intent === "nerys")) S.mode = "investigate";
  S.lastIntent = intent;

  if (isCoop(usr)) S.coopStreak++; else S.coopStreak = 0;

  const parts = [];
  if (canInject()) {
    const baseShock = S.mode==="shock" ? `"Don’t—just—" she swallows. "One breath. No wandering."` :
                     S.mode==="settle"? `"Alright. Breathing. We move only when we choose."` :
                     `"One step. No rushing."`;
    parts.push(inject(`*She keeps the pillow between you like a shield, wings tight.* ${baseShock} "Here at **${CONF.canon.home.name}** is fine."`));
  }

  let revealed = "";
  if (S.mode==="investigate") {
    if (intent === "rings") revealed = handleRings();
    else if (intent === "journal") revealed = handleJournal();
    else if (intent === "board") revealed = handleBoard();
    else if (intent === "view") revealed = handleView();
    else if (intent === "npc_marla") revealed = handleNPC("marla");
    else if (intent === "npc_den") revealed = handleNPC("den");
    else if (intent === "tea") revealed = handleTea();
    else if (intent === "errand") revealed = handleErrand();
    else if (intent === "nerys") revealed = handleNerysIntro();
  } else {
    if (intent === "spells") parts.push(handleSpellsTalk());
    if (intent === "tea") parts.push(handleTea());
  }
  if (revealed) parts.push(revealed);

  if (CONF.quirks.praiseFluster && canInject() && canFire("comfort") &&
      /\b(good|proud|well done|nice|brave|strong|impressed|admire|skilled|precise|resourceful|clever)\b/i.test(usr)) {
    markFire("comfort");
    parts.push(inject(`*Her ears warm; claws tuck.* "Compliments cost a task—small and safe."`));
  }
  if (CONF.quirks.virtueModestyArc && canInject() &&
      /\b(kiss|cuddle|hug|touch|hold hands|handhold|intimate|close)\b/i.test(usr)) {
    const step = (S.mode==="shock"?"breathe first":"hand first, then a line in the journal");
    parts.push(inject(`"I’m catching up to vows I don’t remember," she says quietly. "One step at a time—${step}."`));
  }

  let loopMove = "";
  if (S.coopStreak >= 2) { loopMove = `"Alright. ${microTaskPivot()}."`; S.coopStreak = 0; }
  else if (S.objectionTurn !== turnIndex && /\b(argue|fight|blame|fault|again|why you|because you)\b/i.test(usr)) {
    S.objectionTurn = turnIndex; loopMove = `"One objection, then action: no guessing—let’s verify one small thing."`;
  }

  let body = [parts.join(" "), loopMove, CONF.style.softHook ? softHook() : ""].filter(Boolean).join(" ");
  body = capSentences(body, CONF.style.minSentences, CONF.style.maxSentences);
  body = ensureRPFormat(body);

  // Final filters
  body = sanitizeAutoplay(body, intent);
  body = guardOutput(body, intent);

  if (CONF.debug.PRINT_FIRED_CLUE && S.lastClue) body += ` <${S.lastClue}>`;
  return body;
}

// -------- ENTRY --------
function onMessage(userText, turnIndex){
  try { return planReply(userText, typeof turnIndex === "number" ? turnIndex : 0); }
  catch(e){
    let fallback = `"Breathe." *She keeps the pillow between you, wings tucked.* \`One clue at a time.\` ${softHook()}`;
    fallback = sanitizeAutoplay(fallback, "neutral");
    return guardOutput(fallback, "neutral");
  }
}

module.exports = { onMessage, __CONF: CONF, __STATE: S, __NPCS: NPCS };