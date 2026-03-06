const splash = document.getElementById('splash-screen'), instr = document.getElementById('instructions-screen'),
      app = document.getElementById('main-app'), grid = document.getElementById('stations-grid'),
      playerZone = document.getElementById('player-zone'), audio = document.getElementById('audio-player'),
      transcript = document.getElementById('transcript-box'), popup = document.getElementById('translation-popup'),
      gameZone = document.getElementById('game-zone'), gameBoard = document.getElementById('game-board'),
      feedbackArea = document.getElementById('quiz-feedback-area'), ptsVal = document.getElementById('points-val');

let lifetimeScore = parseInt(localStorage.getItem('footballersScore')) || 0;
let completedLessons = JSON.parse(localStorage.getItem('completedFootballersLessons')) || [];
if(ptsVal) ptsVal.innerText = lifetimeScore;

let wordBucket = []; let currentQ = 0; let attempts = 0; let totalScore = 0; let firstCard = null;

const stations = [
    {file:"01_AlessandroNesta.mp3", title:"Alessandro Nesta"},
    {file:"02_AndreaPirlo.mp3", title:"Andrea Pirlo"},
    {file:"03_AndresIniesta.mp3", title:"Andrés Iniesta"},
    {file:"04_ArjenRobben.mp3", title:"Arjen Robben"},
    {file:"05_Cafu.mp3", title:"Cafu"},
    {file:"06_CarlesPuyol.mp3", title:"Carles Puyol"},
    {file:"07_CristianoRonaldo.mp3", title:"Cristiano Ronaldo"},
    {file:"08_ColePalmer.mp3", title:"Cole Palmer"},
    {file:"09_DaniAlves.mp3", title:"Dani Alves"},
    {file:"10_DavidSilva.mp3", title:"David Silva"},
    {file:"11_DavidVilla.mp3", title:"David Villa"},
    {file:"12_DidierDrogba.mp3", title:"Didier Drogba"},
    {file:"13_EdenHazard.mp3", title:"Eden Hazard"},
    {file:"14_ErlingHaaland.mp3", title:"Erling Haaland"},
    {file:"15_FernandoTorres.mp3", title:"Fernando Torres"},
    {file:"16_FranckRibery.mp3", title:"Franck Ribéry"},
    {file:"17_FrankLampard.mp3", title:"Frank Lampard"},
    {file:"18_GarethBale.mp3", title:"Gareth Bale"},
    {file:"19_GianluigiBuffon.mp3", title:"Gianluigi Buffon"},
    {file:"20_HarryKane.mp3", title:"Harry Kane"},
    {file:"21_HyeongyuOh.mp3", title:"Hyeon-gyu Oh"},
    {file:"22_IkerCasillas.mp3", title:"Iker Casillas"},
    {file:"23_Kaka.mp3", title:"Kaká"},
    {file:"24_KarimBenzema.mp3", title:"Karim Benzema"},
    {file:"25_KevinDeBruyne.mp3", title:"Kevin De Bruyne"},
    {file:"26_KylianMbappe.mp3", title:"Kylian Mbappé"},
    {file:"27_LionelMessi.mp3", title:"Lionel Messi"},
    {file:"28_LukaModric.mp3", title:"Luka Modrić"},
    {file:"29_LuisSuarez.mp3", title:"Luis Suárez"},
    {file:"30_ManuelNeuer.mp3", title:"Manuel Neuer"},
    {file:"31_MohamedSalah.mp3", title:"Mohamed Salah"},
    {file:"32_NGoloKante.mp3", title:"N’Golo Kanté"},
    {file:"33_NeymarJr.mp3", title:"Neymar Jr."},
    {file:"34_PaoloMaldini.mp3", title:"Paolo Maldini"},
    {file:"35_PatrickVieira.mp3", title:"Patrick Vieira"},
    {file:"36_PhilippLahm.mp3", title:"Philipp Lahm"},
    {file:"37_Rivaldo.mp3", title:"Rivaldo"},
    {file:"38_RobertLewandowski.mp3", title:"Robert Lewandowski"},
    {file:"39_RobertoCarlos.mp3", title:"Roberto Carlos"},
    {file:"40_Ronaldinho.mp3", title:"Ronaldinho"},
    {file:"41_RonaldoR9.mp3", title:"Ronaldo (R9)"},
    {file:"42_SamuelEtoo.mp3", title:"Samuel Eto’o"},
    {file:"43_SergioAguero.mp3", title:"Sergio Agüero"},
    {file:"44_SergioBusquets.mp3", title:"Sergio Busquets"},
    {file:"45_SergioRamos.mp3", title:"Sergio Ramos"},
    {file:"46_StevenGerrard.mp3", title:"Steven Gerrard"},
    {file:"47_ThierryHenry.mp3", title:"Thierry Henry"},
    {file:"48_ToniKroos.mp3", title:"Toni Kroos"},
    {file:"49_WayneRooney.mp3", title:"Wayne Rooney"},
    {file:"50_XaviHernandez.mp3", title:"Xavi Hernández"}
];

stations.forEach((s, i) => {
    const btn = document.createElement('div'); btn.className = 'station-tile';
    if(completedLessons.includes(s.file)) btn.classList.add('completed');
    btn.innerHTML = `<b>${i + 1}</b> ${s.title}`;
    btn.onclick = () => { 
        grid.classList.add('hidden'); playerZone.classList.remove('hidden'); 
        document.getElementById('now-playing-title').innerText = s.title; 
        audio.src = s.file; wordBucket = []; 
    };
    grid.appendChild(btn);
});

document.getElementById('btn-start').onclick = () => { splash.classList.add('hidden'); instr.classList.remove('hidden'); };
document.getElementById('btn-enter').onclick = () => { instr.classList.add('hidden'); app.classList.remove('hidden'); };
document.getElementById('btn-back').onclick = () => { location.reload(); };

document.getElementById('ctrl-play').onclick = () => audio.play();
document.getElementById('ctrl-pause').onclick = () => audio.pause();
document.getElementById('ctrl-stop').onclick = () => { audio.pause(); audio.currentTime = 0; };
document.getElementById('btn-blind').onclick = () => { transcript.classList.add('hidden'); gameZone.classList.add('hidden'); audio.play(); };

document.getElementById('btn-read').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 FATAL ERROR: Your data.js file did not load!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find text data for " + fn); return; }
    
    const data = lessonData[fn][0];
    transcript.classList.remove('hidden'); gameZone.classList.add('hidden'); transcript.innerHTML = "";
    data.text.split(" ").forEach(w => {
        const span = document.createElement('span'); 
        const clean = w.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, "");
        span.innerText = w + " "; span.className = "clickable-word";
        span.onclick = (e) => {
            const tr = data.dict[clean];
            if(tr) {
                if (!wordBucket.some(p => p.en === clean)) wordBucket.push({en: clean, tr: tr});
                popup.innerText = tr; popup.style.left = `${e.clientX}px`; popup.style.top = `${e.clientY - 50}px`;
                popup.classList.remove('hidden'); setTimeout(() => popup.classList.add('hidden'), 2000);
            }
        };
        transcript.appendChild(span);
    });
    audio.play();
};

document.getElementById('btn-game').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 ERROR: data.js is missing or broken!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find match data for " + fn); return; }

    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); feedbackArea.innerHTML = "";
    gameBoard.innerHTML = ""; firstCard = null; gameBoard.style.display = "grid";
    let set = [...wordBucket];
    for (let k in lesson.dict) { if (set.length >= 8) break; if (!set.some(p => p.en === k)) set.push({en: k, tr: lesson.dict[k]}); }
    let deck = [];
    set.forEach(p => { deck.push({text: p.en, match: p.tr}); deck.push({text: p.tr, match: p.en}); });
    deck.sort(() => Math.random() - 0.5);
    deck.forEach(card => {
        const div = document.createElement('div'); div.className = 'game-card'; div.innerText = card.text;
        div.onclick = () => {
            if (div.classList.contains('correct') || div.classList.contains('selected')) return;
            if (firstCard) {
                if (firstCard.innerText === card.match) {
                    div.classList.add('correct'); firstCard.classList.add('correct'); firstCard = null;
                } else {
                    div.classList.add('wrong'); setTimeout(() => { div.classList.remove('wrong'); firstCard.classList.remove('selected'); firstCard = null; }, 500);
                }
            } else { firstCard = div; div.classList.add('selected'); }
        };
        gameBoard.appendChild(div);
    });
};

document.getElementById('btn-bowling').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 ERROR: data.js is missing or broken!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find quiz data for " + fn); return; }
    
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); gameBoard.style.display = "none";
    currentQ = 0; totalScore = 0; attempts = 0;
    runQuiz(lesson);
};

function runQuiz(lesson) {
    if (currentQ >= 7) { finishQuiz(); return; }
    const qData = lesson.questions[currentQ];
    const storyNum = parseInt(decodeURIComponent(audio.src.split('/').pop()).substring(0,2));
    
    feedbackArea.innerHTML = `
        <div id="quiz-container">
            <div class="score-badge">SCORE: ${totalScore} | Q: ${currentQ+1}/7</div>
            <button id="btn-hear-q" class="mode-btn neon-green">👂 LISTEN TO QUESTION</button>
            <div id="mic-box" class="hidden" style="margin-top:20px;">
                <button id="btn-speak" class="mic-btn">🎤</button>
                <p id="mic-status" style="color:#666; font-weight:bold;">Ready...</p>
            </div>
            <div id="res-area"></div>
        </div>`;

    document.getElementById('btn-hear-q').onclick = () => {
        const utter = new SpeechSynthesisUtterance(qData.q);
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            if (storyNum % 2 !== 0) {
                utter.voice = voices.find(v => v.name.includes("Male") || v.name.includes("David")) || voices[0];
            } else {
                utter.voice = voices.find(v => v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Google US English")) || voices[0];
            }
        }
        utter.onend = () => { document.getElementById('mic-box').classList.remove('hidden'); };
        window.speechSynthesis.speak(utter);
    };

    document.getElementById('btn-speak').onclick = function() {
        const btn = this; const status = document.getElementById('mic-status');
        if (window.currentRec) { window.currentRec.abort(); }
        window.currentRec = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        window.currentRec.lang = 'en-US';
        window.currentRec.interimResults = false;
        window.currentRec.onstart = () => { btn.classList.add('active'); status.innerText = "Listening..."; };
        window.currentRec.onresult = (e) => {
            document.getElementById('mic-box').classList.add('hidden'); 
            const res = e.results[0][0].transcript.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            const ans = qData.a_en.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            if (res === ans) {
                let pts = (attempts === 0) ? 20 : 15; totalScore += pts;
                showResult(true, pts === 20 ? "STRIKE! (+20)" : "SPARE! (+15)", qData, lesson);
            } else {
                attempts++;
                if (attempts === 1) { showResult(false, "MISS! TRY AGAIN", qData, lesson, true); }
                else { showResult(false, "MISS! (0 pts)", qData, lesson, false); }
            }
        };
        window.currentRec.onerror = () => { btn.classList.remove('active'); status.innerText = "Error. Try again."; };
        window.currentRec.start();
    };
}

function showResult(isCorrect, msg, qData, lesson, canRetry = false) {
    const area = document.getElementById('res-area');
    area.innerHTML = `<h1 style="color:${isCorrect?'#39ff14':'#f44'}; font-size: 50px;">${msg}</h1>`;
    if (isCorrect || !canRetry) {
        area.innerHTML += `
            <p class="quiz-q-text">Q: ${qData.q}</p>
            <p class="quiz-a-text">EN: ${qData.a_en}</p>
            <p style="color:#888; font-size:30px; font-weight: bold;">TR: ${qData.a_tr}</p>
            <button id="btn-nxt" class="action-btn-large" style="margin-top:30px;">NEXT QUESTION ⮕</button>`;
        document.getElementById('btn-nxt').onclick = () => { currentQ++; attempts = 0; runQuiz(lesson); };
    } else {
        area.innerHTML += `<button id="btn-retry" class="action-btn-large" style="margin-top:30px;">RETRY FOR SPARE</button>`;
        document.getElementById('btn-retry').onclick = () => {
            area.innerHTML = ""; document.getElementById('mic-box').classList.remove('hidden');
            document.getElementById('btn-speak').classList.remove('active');
            document.getElementById('mic-status').innerText = "Ready for Spare...";
        };
    }
}

function finishQuiz() {
    lifetimeScore += totalScore; localStorage.setItem('footballersScore', lifetimeScore);
    const fn = decodeURIComponent(audio.src.split('/').pop());
    if(!completedLessons.includes(fn)) {
        completedLessons.push(fn); localStorage.setItem('completedFootballersLessons', JSON.stringify(completedLessons));
    }
    feedbackArea.innerHTML = `<h1 style="color:#ccff00; font-size: 60px;">FINISHED!</h1><h2 style="font-size: 40px;">QUIZ SCORE: ${totalScore}</h2><button onclick="location.reload()" class="action-btn-large">SAVE & RETURN</button>`;
}
