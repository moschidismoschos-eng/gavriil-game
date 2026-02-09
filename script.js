"use strict";
const $ = (id)=>document.getElementById(id);

const UI = {
  title:$("t_title"), sub:$("t_sub"), sound:$("t_sound"),
  levelLbl:$("t_level"), timeLbl:$("t_time"),
  diagLbl:$("t_diag"), washLbl:$("t_wash"), paintLbl:$("t_paint"), newLbl:$("t_new"),
  toolsLbl:$("t_tools"), logLbl:$("t_log"),
  level:$("level"), stars:$("stars"), time:$("time"),
  carImg:$("carImg"), carName:$("carName"),
  task:$("task"), tools:$("tools"), log:$("log"),
  toast:$("toast"),
  langSel:$("langSel"), soundBtn:$("soundBtn"), vol:$("vol"),
  diagBtn:$("diagBtn"), washBtn:$("washBtn"), paintBtn:$("paintBtn"), newBtn:$("newBtn")
};

const state = {
  lang:"el",
  soundOn:true,
  vol:0.7,
  level:1,
  stars:0,
  startTs:Date.now(),
  diagnosed:false,
  car:null,
  fault:null
};

// Βάλε δικές σου εικόνες εδώ (θα δουλεύει και χωρίς, απλά δείχνει placeholder)
const CARS = [
  {name_el:"Αυτοκίνητο", name_en:"Car", img:"assets/cars/car.png"},
  {name_el:"Βανάκι", name_en:"Van", img:"assets/cars/van.png"},
  {name_el:"Φορτηγό", name_en:"Truck", img:"assets/cars/truck.png"}
];

const TOOLS = [
  {key:"jack", el:"Γρύλος", en:"Jack", img:"assets/tools/jack.png"},
  {key:"battery", el:"Μπαταρία", en:"Battery", img:"assets/tools/battery.png"},
  {key:"oil", el:"Λάδι", en:"Oil", img:"assets/tools/oil.png"},
  {key:"lamp", el:"Λάμπα", en:"Lamp", img:"assets/tools/lamp.png"}
];

const FAULTS = [
  {key:"tire", el:"Σκασμένο λάστιχο", en:"Flat tire", need:"jack"},
  {key:"battery", el:"Άδεια μπαταρία", en:"Dead battery", need:"battery"},
  {key:"oil", el:"Χρειάζεται λάδι", en:"Needs oil", need:"oil"},
  {key:"lights", el:"Καμένο φως", en:"Broken light", need:"lamp"}
];

// Ήχοι (βάζεις αρχεία στο assets/sounds/)
const SFX = {
  click:"assets/sounds/ui_click.mp3",
  success:"assets/sounds/success.mp3",
  wrong:"assets/sounds/wrong.mp3",
  ratchet:"assets/sounds/ratchet.mp3",
  wash:"assets/sounds/wash.mp3",
  spray:"assets/sounds/spray.mp3"
};

const Sound = {
  cache:new Map(),
  play(k){
    if(!state.soundOn) return;
    const src = SFX[k]; if(!src) return;
    let a = this.cache.get(src);
    if(!a){ a = new Audio(src); a.preload="auto"; this.cache.set(src,a); }
    a.volume = state.vol;
    try{ a.currentTime=0; a.play(); }catch{}
  }
};

let T = {};
async function loadLang(lang){
  const r = await fetch(`lang/${lang}.json`, {cache:"no-store"});
  T = await r.json();
  document.documentElement.lang = lang;
}

const tr = (k)=>T[k]||k;

function setTexts(){
  UI.title.textContent = tr("title");
  UI.sub.textContent = tr("sub");
  UI.sound.textContent = tr("sound");
  UI.levelLbl.textContent = tr("level");
  UI.timeLbl.textContent = tr("time");
  UI.diagLbl.textContent = tr("diag");
  UI.washLbl.textContent = tr("wash");
  UI.paintLbl.textContent = tr("paint");
  UI.newLbl.textContent = tr("new");
  UI.toolsLbl.textContent = tr("tools");
  UI.logLbl.textContent = tr("log");
}

function toast(msg){
  UI.toast.textContent = msg;
  UI.toast.classList.add("show");
  setTimeout(()=>UI.toast.classList.remove("show"), 1200);
}

function logLine(s){
  UI.log.textContent = (UI.log.textContent ? UI.log.textContent+"\n":"") + s;
}

function pad2(n){ return String(n).padStart(2,"0"); }
function tick(){
  const sec = Math.floor((Date.now()-state.startTs)/1000);
  UI.time.textContent = `${pad2(Math.floor(sec/60))}:${pad2(sec%60)}`;
  requestAnimationFrame(tick);
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function carName(c){ return state.lang==="el"?c.name_el:c.name_en; }
function faultName(f){ return state.lang==="el"?f.el:f.en; }
function toolName(t){ return state.lang==="el"?t.el:t.en; }

function renderCar(){
  UI.carName.textContent = carName(state.car);
  UI.carImg.src = state.car.img;
  UI.carImg.onerror = () => { UI.carImg.removeAttribute("src"); UI.carImg.alt="(βάλε εικόνα στο assets/cars/)"; };
}

function renderTools(){
  UI.tools.innerHTML = "";
  TOOLS.forEach(t=>{
    const b = document.createElement("button");
    b.className = "tool";
    b.type = "button";

    const img = document.createElement("img");
    img.src = t.img;
    img.alt = toolName(t);
    img.onerror = () => { img.style.display="none"; };

    const box = document.createElement("div");
    const n = document.createElement("div");
    n.className = "name"; n.textContent = toolName(t);
    const sub = document.createElement("div");
    sub.className = "sub"; sub.textContent = " ";
    box.appendChild(n); box.appendChild(sub);

    b.appendChild(img); b.appendChild(box);

    b.addEventListener("click", ()=>{
      Sound.play("click");
      if(!state.diagnosed){
        UI.task.textContent = tr("ready");
        toast(tr("ready"));
        UI.tools.classList.add("shake");
        setTimeout(()=>UI.tools.classList.remove("shake"), 250);
        return;
      }
      if(t.key === state.fault.need){
        state.stars += 1;
        UI.stars.textContent = String(state.stars);
        Sound.play("success");
        UI.task.textContent = tr("correct");
        toast("⭐ +1");
        logLine("✅ "+tr("correct"));
        next();
      }else{
        Sound.play("wrong");
        UI.task.textContent = tr("wrong");
        toast(tr("wrong"));
        UI.tools.classList.add("shake");
        setTimeout(()=>UI.tools.classList.remove("shake"), 250);
        logLine("❌ "+tr("wrong"));
      }
    });

    UI.tools.appendChild(b);
  });
}

function next(){
  state.level += 1;
  UI.level.textContent = String(state.level);
  state.car = pick(CARS);
  state.fault = pick(FAULTS);
  state.diagnosed = false;
  renderCar();
  UI.task.textContent = tr("ready");
}

function newGame(){
  state.level=1; state.stars=0;
  UI.level.textContent="1"; UI.stars.textContent="0";
  UI.log.textContent="";
  state.startTs = Date.now();
  state.car = pick(CARS);
  state.fault = pick(FAULTS);
  state.diagnosed=false;
  renderCar();
  UI.task.textContent = tr("ready");
  logLine("🎮 "+tr("ready"));
}

UI.diagBtn.addEventListener("click", ()=>{
  Sound.play("ratchet");
  state.diagnosed=true;
  UI.task.textContent = `${tr("found")}: ${faultName(state.fault)}. ${tr("pick")}`;
  toast(tr("found"));
  logLine("🔍 "+tr("found")+": "+faultName(state.fault));
});

UI.washBtn.addEventListener("click", ()=>{
  Sound.play("wash");
  UI.task.textContent = tr("washed");
  toast(tr("washed"));
  logLine("🧼 "+tr("washed"));
});

UI.paintBtn.addEventListener("click", ()=>{
  Sound.play("spray");
  UI.task.textContent = tr("painted");
  toast(tr("painted"));
  logLine("🎨 "+tr("painted"));
});

UI.newBtn.addEventListener("click", ()=>{
  Sound.play("click");
  newGame();
});

UI.soundBtn.addEventListener("click", ()=>{
  state.soundOn = !state.soundOn;
  UI.soundBtn.firstChild.textContent = state.soundOn ? "🔊 " : "🔇 ";
  if(state.soundOn) Sound.play("click");
});

UI.vol.addEventListener("input", ()=>{ state.vol = Number(UI.vol.value)/100; });
UI.langSel.addEventListener("change", async ()=>{
  Sound.play("click");
  state.lang = UI.langSel.value;
  await loadLang(state.lang);
  setTexts();
  renderCar();
  renderTools();
  UI.task.textContent = tr("ready");
});

(async function init(){
  await loadLang(state.lang);
  setTexts();
  renderTools();
  newGame();
  tick();
})();
