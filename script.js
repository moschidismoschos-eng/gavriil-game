// Συνεργείο παιδικό παιχνίδι (χωρίς εξωτερικές βιβλιοθήκες)

const elLevel = document.getElementById("level");
const elStars = document.getElementById("stars");
const elTime = document.getElementById("time");

const elCarName = document.getElementById("carName");
const elCarEmoji = document.getElementById("carEmoji");
const elBadges = document.getElementById("badges");
const elTaskText = document.getElementById("taskText");

const toolsEl = document.getElementById("tools");
const logEl = document.getElementById("log");

const diagBtn = document.getElementById("diagBtn");
const washBtn = document.getElementById("washBtn");
const paintBtn = document.getElementById("paintBtn");
const nextBtn = document.getElementById("nextBtn");
const newBtn = document.getElementById("newBtn");
const endlessBtn = document.getElementById("endlessBtn");

const miniModal = document.getElementById("miniModal");
const miniTitle = document.getElementById("miniTitle");
const miniHint = document.getElementById("miniHint");
const miniArea = document.getElementById("miniArea");
const miniClose = document.getElementById("miniClose");

const toastEl = document.getElementById("toast");

const CARS = [
  { name:"Μικρό αυτοκίνητο", emoji:"🚗" },
  { name:"Τζιπ", emoji:"🚙" },
  { name:"Φορτηγό", emoji:"🚚" },
  { name:"Βανάκι", emoji:"🚐" },
  { name:"Ταξί", emoji:"🚕" },
  { name:"Περιπολικό", emoji:"🚓" },
  { name:"Ασθενοφόρο", emoji:"🚑" },
  { name:"Πυροσβεστικό", emoji:"🚒" },
  { name:"Αγωνιστικό", emoji:"🏎️" },
  { name:"Λεωφορείο", emoji:"🚌" },
  { name:"Pickup", emoji:"🛻" },
  { name:"Τρακτέρ", emoji:"🚜" },
  { name:"Μηχανάκι", emoji:"🛵" },
  { name:"Νταλίκα", emoji:"🚛" },
  { name:"Τρίκυκλο", emoji:"🛺" }
];

const FAULTS = {
  tire: { key:"tire", label:"Σκασμένο λάστιχο", badge:"🛞", tool:"jack" },
  battery: { key:"battery", label:"Άδεια μπαταρία", badge:"🔋", tool:"battery" },
  oil: { key:"oil", label:"Χρειάζεται λάδι", badge:"🛢️", tool:"oil" },
  lights: { key:"lights", label:"Καμένο φανάρι", badge:"💡", tool:"bulb" },
  overheat: { key:"overheat", label:"Υπερθέρμανση", badge:"🌡️", tool:"coolant" },
  dirty: { key:"dirty", label:"Βρώμικο", badge:"🧼", tool:"sponge" }
};

const TOOLS = [
  { id:"jack", ico:"🛞", title:"Ρεζέρβα / Γρύλος", desc:"για λάστιχο" },
  { id:"battery", ico:"🔋", title:"Μπαταρία", desc:"για εκκίνηση" },
  { id:"oil", ico:"🛢️", title:"Λάδι", desc:"για τον κινητήρα" },
  { id:"bulb", ico:"💡", title:"Λαμπάκι", desc:"για φώτα" },
  { id:"coolant", ico:"🧯", title:"Νερό/Ψυκτικό", desc:"για θερμοκρασία" },
  { id:"sponge", ico:"🧽", title:"Σφουγγάρι", desc:"για πλύσιμο" }
];

// 25 πίστες (1-25). Μετά: endless (random)
const LEVELS = [
  ["dirty"],
  ["tire"],
  ["oil"],
  ["battery"],
  ["lights"],
  ["dirty","tire"],
  ["oil","dirty"],
  ["battery","dirty"],
  ["lights","dirty"],
  ["overheat"],
  ["tire","oil"],
  ["battery","lights"],
  ["overheat","dirty"],
  ["tire","battery"],
  ["oil","lights"],
  ["tire","dirty","oil"],
  ["battery","dirty","lights"],
  ["overheat","tire"],
  ["overheat","battery"],
  ["overheat","oil","dirty"],
  ["tire","battery","lights"],
  ["tire","oil","lights"],
  ["battery","oil","dirty"],
  ["overheat","tire","dirty"],
  ["overheat","tire","battery","dirty"]
];

let state = {
  level: 1,
  stars: 0,
  currentCar: null,
  faults: [],
  diagnosed: false,
  fixed: new Set(),
  painted: false,
  washed: false,
  endless: false,
  seconds: 0,
  timerId: null
};

function pad(n){ return String(n).padStart(2,"0"); }
function fmtTime(s){ return `${pad(Math.floor(s/60))}:${pad(s%60)}`; }

function toast(text){
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  setTimeout(()=>toastEl.classList.add("hidden"), 1300);
}

function log(text, good=false){
  logEl.textContent = text;
  logEl.style.color = good ? "var(--ok)" : "var(--muted)";
}

function startTimer(){
  stopTimer();
  state.seconds = 0;
  elTime.textContent = "00:00";
  state.timerId = setInterval(()=>{
    state.seconds += 1;
    elTime.textContent = fmtTime(state.seconds);
  }, 1000);
}
function stopTimer(){
  if (state.timerId){
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function renderTools(){
  toolsEl.innerHTML = "";
  TOOLS.forEach(t=>{
    const btn = document.createElement("button");
    btn.className = "tool";
    btn.type = "button";
    btn.dataset.id = t.id;
    btn.innerHTML = `
      <div class="ico">${t.ico}</div>
      <div class="txt"><b>${t.title}</b><span>${t.desc}</span></div>
    `;
    btn.addEventListener("click", ()=>useTool(t.id));
    toolsEl.appendChild(btn);
  });
}

function setBadges(){
  elBadges.innerHTML = "";
  state.faults.forEach(k=>{
    const f = FAULTS[k];
    const b = document.createElement("div");
    b.className = "badge bad";
    const fixed = state.fixed.has(k);
    b.textContent = fixed ? `✅ ${f.badge} ${f.label}` : `${f.badge} ${f.label}`;
    elBadges.appendChild(b);
  });
}

function currentFaultsText(){
  if (!state.diagnosed) return "Πάτα «Διάγνωση» για να δεις τι χάλασε.";
  const remaining = state.faults.filter(k=>!state.fixed.has(k));
  if (remaining.length === 0){
    return "Τέλειο! Το αμάξι είναι έτοιμο. Πάτα «Επόμενο αυτοκίνητο».";
  }
  const names = remaining.map(k=>FAULTS[k].label).join(", ");
  return `Χάλασε: ${names}. Διάλεξε το σωστό εργαλείο!`;
}

function setTaskText(){
  elTaskText.textContent = currentFaultsText();
}

function levelFaults(level){
  if (state.endless){
    // random: 1-3 βλάβες, σπάνια 4
    const keys = Object.keys(FAULTS);
    shuffle(keys);
    const count = Math.random() < 0.1 ? 4 : (Math.random()<0.45 ? 1 : (Math.random()<0.85 ? 2 : 3));
    const faults = keys.slice(0, count);
    // προσθέτουμε συχνά "dirty" για παιδικό
    if (!faults.includes("dirty") && Math.random() < 0.35) faults.push("dirty");
    return Array.from(new Set(faults));
  }
  const idx = Math.min(level, LEVELS.length) - 1;
  return LEVELS[idx] ? [...LEVELS[idx]] : [...LEVELS[LEVELS.length-1]];
}

function pickCar(){
  // εναλλαγή τύπων – τυχαίο
  return rand(CARS);
}

function resetForNewCar(){
  state.currentCar = pickCar();
  state.faults = levelFaults(state.level);
  state.diagnosed = false;
  state.fixed = new Set();
  state.painted = false;
  state.washed = false;

  elCarName.textContent = state.currentCar.name;
  elCarEmoji.textContent = state.currentCar.emoji;

  elLevel.textContent = String(state.level);
  elStars.textContent = String(state.stars);
  setBadges();
  setTaskText();

  nextBtn.disabled = true;
  log("Διάλεξε «Διάγνωση» για να ξεκινήσεις.");
  startTimer();
}

function diagnose(){
  state.diagnosed = true;
  setBadges();
  setTaskText();
  log("Εντάξει! Τώρα διάλεξε εργαλείο.", true);
  toast("🔍 Διάγνωση ολοκληρώθηκε");
}

function canFinish(){
  const remaining = state.faults.filter(k=>!state.fixed.has(k));
  return remaining.length === 0;
}

function awardStars(){
  // απλό σύστημα: γρήγορα => 3, μέτρια =>2, αργά =>1
  const s = state.seconds;
  let add = 1;
  if (s <= 25) add = 3;
  else if (s <= 45) add = 2;
  state.stars += add;
  elStars.textContent = String(state.stars);
  toast(`⭐ +${add}`);
}

function finishCar(){
  stopTimer();
  awardStars();
  log("ΜΠΡΑΒΟ! Το έφτιαξες! Πάτα «Επόμενο αυτοκίνητο».", true);
  nextBtn.disabled = false;
  setTaskText();
}

function wash(){
  if (!state.diagnosed){
    toast("Πρώτα διάγνωση!");
    return;
  }
  // πλύσιμο = φτιάχνει dirty αν υπάρχει
  if (state.faults.includes("dirty") && !state.fixed.has("dirty")){
    state.fixed.add("dirty");
    state.washed = true;
    toast("🚿 Καθαρό!");
    log("Καθάρισες το αμάξι. 👍", true);
    setBadges();
    setTaskText();
    if (canFinish()) finishCar();
  } else {
    toast("Δεν χρειάζεται πλύσιμο τώρα.");
  }
}

function paint(){
  if (!state.diagnosed){
    toast("Πρώτα διάγνωση!");
    return;
  }
  state.painted = true;
  // “αθώο” fun feature
  toast("🎨 Έβαψες το αμάξι!");
  log("Ωραίο χρώμα! 😄", true);
}

function openMiniGameTire(onWin){
  miniTitle.textContent = "🛞 Αλλαγή λάστιχου";
  miniHint.textContent = "Πάτα τα μπουλόνια με τη σωστή σειρά: 1 → 2 → 3 → 4";
  miniArea.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "bolts";

  let expected = 1;

  for (let i=1;i<=4;i++){
    const b = document.createElement("button");
    b.className = "bolt";
    b.type = "button";
    b.textContent = String(i);
    b.addEventListener("click", ()=>{
      if (i === expected){
        b.classList.add("good");
        b.disabled = true;
        expected += 1;
        if (expected === 5){
          // νίκη
          hideMini();
          toast("🛞 Έτοιμο!");
          onWin();
        }
      } else {
        b.classList.add("bad");
        setTimeout(()=>b.classList.remove("bad"), 250);
        toast("❌ Λάθος σειρά!");
      }
    });
    wrap.appendChild(b);
  }

  miniArea.appendChild(wrap);
  miniModal.classList.remove("hidden");
}

function hideMini(){
  miniModal.classList.add("hidden");
}

function useTool(toolId){
  if (!state.diagnosed){
    toast("Πρώτα διάγνωση!");
    return;
  }

  const remaining = state.faults.filter(k=>!state.fixed.has(k));
  if (remaining.length === 0){
    toast("Το αμάξι είναι ήδη έτοιμο!");
    return;
  }

  // αν το εργαλείο ταιριάζει με κάποια βλάβη που μένει
  const match = remaining.find(k => FAULTS[k].tool === toolId);

  if (!match){
    toast("❌ Αυτό δεν ταιριάζει");
    log("Δοκίμασε άλλο εργαλείο.", false);
    return;
  }

  // ειδική περίπτωση: λάστιχο με mini game
  if (match === "tire"){
    openMiniGameTire(()=>{
      state.fixed.add("tire");
      setBadges();
      setTaskText();
      log("Έφτιαξες το λάστιχο! ✅", true);
      if (canFinish()) finishCar();
    });
    return;
  }

  // απλό fix
  state.fixed.add(match);
  setBadges();
  setTaskText();
  toast("✅ Επιδιόρθωση!");
  log(`Έφτιαξες: ${FAULTS[match].label} ✅`, true);

  if (canFinish()) finishCar();
}

function nextCar(){
  if (!canFinish()){
    toast("Πρώτα φτιάξε όλες τις βλάβες!");
    return;
  }
  state.level += 1;
  elLevel.textContent = String(state.level);

  // μετά την πίστα 25, προτείνουμε endless
  if (!state.endless && state.level > 25){
    log("Τέλος οι πίστες! Πάτα «Endless» για ατελείωτα αυτοκίνητα 😄", true);
    toast("🏁 Τέλος πιστών!");
    // κρατάμε level = 25 και περιμένουμε endless
    state.level = 25;
    elLevel.textContent = "25";
    nextBtn.disabled = true;
    return;
  }

  resetForNewCar();
}

function newGame(){
  state = {
    level: 1,
    stars: 0,
    currentCar: null,
    faults: [],
    diagnosed: false,
    fixed: new Set(),
    painted: false,
    washed: false,
    endless: false,
    seconds: 0,
    timerId: null
  };
  renderTools();
  resetForNewCar();
}

function enableEndless(){
  state.endless = true;
  toast("♾️ Endless ON");
  log("Endless mode! Κάθε φορά τυχαίες βλάβες.", true);
  state.level += 1;
  elLevel.textContent = String(state.level);
  resetForNewCar();
}

// events
diagBtn.addEventListener("click", diagnose);
washBtn.addEventListener("click", wash);
paintBtn.addEventListener("click", paint);
nextBtn.addEventListener("click", nextCar);
newBtn.addEventListener("click", newGame);
endlessBtn.addEventListener("click", enableEndless);
miniClose.addEventListener("click", hideMini);

// init
renderTools();
resetForNewCar();
