// Gavriil Safety Adventure
// Δίγλωσσο: Ελληνικά / Αγγλικά
// Βίντεο ανά κεφάλαιο + εφέ (confetti, shake), σκορ, ζωές, ήχοι (προαιρετικά)

const UI = {
  langSelect: document.getElementById("langSelect"),
  subtitle: document.getElementById("subtitle"),
  chapterPill: document.getElementById("chapterPill"),
  scoreEl: document.getElementById("score"),
  livesEl: document.getElementById("lives"),
  levelTitle: document.getElementById("levelTitle"),
  question: document.getElementById("question"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  nextBtn: document.getElementById("nextBtn"),
  retryBtn: document.getElementById("retryBtn"),
  video: document.getElementById("sceneVideo"),
  videoSource: document.getElementById("videoSource"),
  videoHint: document.getElementById("videoHint"),
  footerLine1: document.getElementById("footerLine1"),
  footerLine2: document.getElementById("footerLine2"),
  soundToggle: document.getElementById("soundToggle"),
  sndClick: document.getElementById("sndClick"),
  sndCorrect: document.getElementById("sndCorrect"),
  sndWrong: document.getElementById("sndWrong"),
  sndWin: document.getElementById("sndWin"),
};

let state = {
  lang: "el",
  score: 0,
  lives: 3,
  idx: 0,
  locked: false,
  soundOn: true,
};

const t = {
  el: {
    subtitle: "Μάθε ασφάλεια παίζοντας",
    chapter: (i, n) => `Κεφάλαιο ${i}/${n}`,
    score: (s) => `⭐ Σκορ: ${s}`,
    lives: (l) => `❤️ ${l}`,
    next: "➡️ Επόμενο",
    retry: "🔄 Ξανά",
    correct: "✅ Σωστά! Μπράβο!",
    wrong: "❌ Όχι. Δοκίμασε ξανά!",
    outOfLivesTitle: "Τέλος παιχνιδιού 😅",
    outOfLivesText: "Τελείωσαν οι ζωές. Θες να ξαναπαίξεις;",
    playAgain: "🔄 Παίξε ξανά",
    winTitle: "🎉 Τέλος!",
    winText: (s) => `Το τελικό σου σκορ είναι: ${s}`,
    cert: "🏆 Πιστοποιητικό Ασφάλειας",
    certText: "Είσαι μικρός ήρωας ασφάλειας!",
    missingVideo: (path) => `Αν δεν βλέπεις βίντεο, βάλε το αρχείο <b>${path}</b>.`,
    soundOn: "🔊",
    soundOff: "🔇",
  },
  en: {
    subtitle: "Learn safety by playing",
    chapter: (i, n) => `Chapter ${i}/${n}`,
    score: (s) => `⭐ Score: ${s}`,
    lives: (l) => `❤️ ${l}`,
    next: "➡️ Next",
    retry: "🔄 Retry",
    correct: "✅ Correct! Well done!",
    wrong: "❌ Not quite. Try again!",
    outOfLivesTitle: "Game over 😅",
    outOfLivesText: "You ran out of lives. Play again?",
    playAgain: "🔄 Play again",
    winTitle: "🎉 Finished!",
    winText: (s) => `Your final score is: ${s}`,
    cert: "🏆 Safety Certificate",
    certText: "You are a little safety hero!",
    missingVideo: (path) => `If you don't see a video, add the file <b>${path}</b>.`,
    soundOn: "🔊",
    soundOff: "🔇",
  }
};

// Chapters (videos are local files you put in assets/videos/)
const chapters = [
  {
    video: "assets/videos/door.mp4",
    el: {
      title: "Σπίτι: Πόρτα & ξένοι",
      q: "Κάποιος χτυπάει την πόρτα και λέει: «Άνοιξε, είμαι φίλος του μπαμπά». Τι κάνεις;",
      answers: [
        "Ανοίγω την πόρτα",
        "Ρωτάω ποιος είναι και φωνάζω τη μαμά/μπαμπά",
        "Του λέω να φύγει και ανοίγω λίγο να δω"
      ],
      correct: 1,
    },
    en: {
      title: "Home: Door & strangers",
      q: "Someone knocks and says: “Open up, I'm dad's friend.” What do you do?",
      answers: [
        "Open the door",
        "Ask who it is and call mom/dad",
        "Open a little to look"
      ],
      correct: 1,
    }
  },
  {
    video: "assets/videos/sidewalk.mp4",
    el: {
      title: "Δρόμος: Πεζοδρόμιο",
      q: "Περπατάς στη γειτονιά. Πού πρέπει να περπατάς;",
      answers: [
        "Στη μέση του δρόμου",
        "Στο πεζοδρόμιο",
        "Όπου βρω χώρο"
      ],
      correct: 1,
    },
    en: {
      title: "Street: Sidewalk",
      q: "You're walking outside. Where should you walk?",
      answers: [
        "In the middle of the road",
        "On the sidewalk",
        "Anywhere I find space"
      ],
      correct: 1,
    }
  },
  {
    video: "assets/videos/trafficlight.mp4",
    el: {
      title: "Δρόμος: Φανάρι",
      q: "Το φανάρι για πεζούς είναι κόκκινο. Τι κάνεις;",
      answers: [
        "Περνάω γρήγορα",
        "Περιμένω να γίνει πράσινο",
        "Κοιτάω και περνάω αν δεν έχει αμάξι"
      ],
      correct: 1,
    },
    en: {
      title: "Street: Traffic light",
      q: "The pedestrian light is red. What do you do?",
      answers: [
        "Cross quickly",
        "Wait for green",
        "Look and cross if no cars"
      ],
      correct: 1,
    }
  },
  {
    video: "assets/videos/stranger.mp4",
    el: {
      title: "Σχολείο: Άγνωστος",
      q: "Ένας άγνωστος σου λέει: «Έλα να σου δώσω σοκολάτα». Τι κάνεις;",
      answers: [
        "Πάω μαζί του",
        "Φεύγω και πάω σε δάσκαλο/γονέα",
        "Μένω εκεί και μιλάω μαζί του"
      ],
      correct: 1,
    },
    en: {
      title: "School: Stranger",
      q: "A stranger says: “Come, I’ll give you chocolate.” What do you do?",
      answers: [
        "Go with them",
        "Leave and go to a teacher/parent",
        "Stay and talk"
      ],
      correct: 1,
    }
  },
  {
    video: "assets/videos/school.mp4",
    el: {
      title: "Σχολείο: Χάθηκα",
      q: "Χάθηκες κοντά στο σχολείο. Τι κάνεις;",
      answers: [
        "Τρέχω μόνος μου να βρω σπίτι",
        "Πηγαίνω σε δάσκαλο/γραμματεία και ζητάω βοήθεια",
        "Κρύβομαι και περιμένω"
      ],
      correct: 1,
    },
    en: {
      title: "School: I’m lost",
      q: "You are lost near school. What do you do?",
      answers: [
        "Run home alone",
        "Go to a teacher/office and ask for help",
        "Hide and wait"
      ],
      correct: 1,
    }
  },
  {
    video: "assets/videos/bus.mp4",
    el: {
      title: "Μετακίνηση: Στάση/Λεωφορείο",
      q: "Περιμένεις το λεωφορείο. Πού στέκεσαι;",
      answers: [
        "Στην άκρη του δρόμου, πολύ κοντά",
        "Στη στάση, λίγο πίσω από το πεζοδρόμιο",
        "Μέσα στο δρόμο για να το βλέπω"
      ],
      correct: 1,
    },
    en: {
      title: "Transport: Bus stop",
      q: "You are waiting for the bus. Where do you stand?",
      answers: [
        "Right at the edge of the road",
        "At the stop, a bit back on the sidewalk",
        "In the road so I can see it"
      ],
      correct: 1,
    }
  }
];

function safePlay(audioEl){
  if(!state.soundOn) return;
  if(!audioEl) return;
  try{
    audioEl.currentTime = 0;
    audioEl.play().catch(()=>{});
  }catch(e){}
}

function updateTopUI(){
  const n = chapters.length;
  UI.subtitle.textContent = t[state.lang].subtitle;
  UI.chapterPill.textContent = t[state.lang].chapter(state.idx + 1, n);
  UI.scoreEl.textContent = state.score;
  UI.livesEl.textContent = state.lives;
  UI.nextBtn.textContent = t[state.lang].next;
  UI.retryBtn.textContent = t[state.lang].retry;
  UI.soundToggle.textContent = state.soundOn ? t[state.lang].soundOn : t[state.lang].soundOff;

  // Footer bilingual
  UI.footerLine1.textContent = state.lang === "el"
    ? "© 2026 Gavriil Safety Adventure | Μόσχος"
    : "© 2026 Gavriil Safety Adventure | Moschos";
  UI.footerLine2.textContent = state.lang === "el"
    ? "Μάθε να είσαι ασφαλής – στο σπίτι, στο δρόμο και στο σχολείο."
    : "Learn to stay safe – at home, on the street, and at school.";
}

function renderChapter(){
  state.locked = false;
  UI.nextBtn.disabled = true;
  UI.retryBtn.hidden = true;
  UI.feedback.className = "feedback";
  UI.feedback.textContent = "";

  const ch = chapters[state.idx];
  const loc = ch[state.lang];

  UI.levelTitle.textContent = loc.title;
  UI.question.textContent = loc.q;

  // Video
  UI.videoHint.innerHTML = t[state.lang].missingVideo(ch.video);
  UI.videoHint.style.display = "none";
  UI.videoSource.src = ch.video;
  UI.video.load();

  // Show hint if video fails to load
  const showHint = () => { UI.videoHint.style.display = "block"; };
  UI.video.onerror = showHint;
  UI.video.addEventListener("error", showHint, { once: true });

  // Answers
  UI.answers.innerHTML = "";
  loc.answers.forEach((txt, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = txt;
    btn.addEventListener("click", () => onAnswer(i));
    UI.answers.appendChild(btn);
  });

  updateTopUI();
}

function confettiBurst(count=26){
  for(let i=0;i<count;i++){
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random()*100 + "vw";
    c.style.transform = `translateY(0) rotate(${Math.random()*180}deg)`;
    c.style.background = `hsl(${Math.floor(Math.random()*360)}, 90%, 65%)`;
    c.style.animationDuration = (0.9 + Math.random()*0.7) + "s";
    document.body.appendChild(c);
    setTimeout(()=>c.remove(), 1800);
  }
}

function shakeCard(){
  const card = document.querySelector(".card");
  card.classList.remove("shake");
  // reflow
  void card.offsetWidth;
  card.classList.add("shake");
  setTimeout(()=>card.classList.remove("shake"), 400);
}

function onAnswer(choiceIdx){
  if(state.locked) return;
  safePlay(UI.sndClick);

  const ch = chapters[state.idx][state.lang];
  const correctIdx = ch.correct;

  const buttons = Array.from(UI.answers.querySelectorAll("button.choice"));
  buttons.forEach(b => b.disabled = true);

  state.locked = true;

  if(choiceIdx === correctIdx){
    buttons[choiceIdx].classList.add("correct");
    UI.feedback.classList.add("good");
    UI.feedback.textContent = t[state.lang].correct;
    state.score += 10;
    UI.nextBtn.disabled = false;
    confettiBurst(24);
    safePlay(UI.sndCorrect);
  } else {
    buttons[choiceIdx].classList.add("wrong");
    buttons[correctIdx].classList.add("correct");
    UI.feedback.classList.add("bad");
    UI.feedback.textContent = t[state.lang].wrong;
    state.lives -= 1;
    shakeCard();
    if(navigator.vibrate) navigator.vibrate(120);
    safePlay(UI.sndWrong);

    if(state.lives <= 0){
      setTimeout(()=>renderGameOver(), 450);
      return;
    }
    UI.retryBtn.hidden = false;
  }

  updateTopUI();
}

function renderGameOver(){
  const lang = state.lang;
  document.querySelector(".card").innerHTML = `
    <div class="row">
      <div class="pill">${t[lang].chapter(chapters.length, chapters.length)}</div>
      <div class="pill">⭐ ${state.score}</div>
    </div>
    <h1>${t[lang].outOfLivesTitle}</h1>
    <p class="question">${t[lang].outOfLivesText}</p>
    <div class="actions">
      <button class="primary" id="playAgainBtn" type="button">${t[lang].playAgain}</button>
    </div>
  `;
  document.getElementById("playAgainBtn").addEventListener("click", () => location.reload());
}

function renderWin(){
  const lang = state.lang;
  safePlay(UI.sndWin);
  confettiBurst(50);

  document.querySelector(".card").innerHTML = `
    <div class="row">
      <div class="pill">⭐ ${state.score}</div>
      <div class="pill">${t[lang].cert}</div>
    </div>
    <h1>${t[lang].winTitle}</h1>
    <p class="question">${t[lang].winText(state.score)}</p>
    <p class="question">${t[lang].certText}</p>
    <div class="actions">
      <button class="primary" id="playAgainBtn" type="button">${t[lang].playAgain}</button>
    </div>
  `;
  document.getElementById("playAgainBtn").addEventListener("click", () => location.reload());
}

UI.nextBtn.addEventListener("click", () => {
  if(state.idx < chapters.length - 1){
    state.idx += 1;
    renderChapter();
  } else {
    renderWin();
  }
});

UI.retryBtn.addEventListener("click", () => {
  // retry same chapter (no score change)
  renderChapter();
});

UI.langSelect.addEventListener("change", (e) => {
  state.lang = e.target.value;
  // keep current index, rerender
  renderChapter();
});

UI.soundToggle.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  updateTopUI();
});

renderChapter();
