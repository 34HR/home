document.addEventListener("DOMContentLoaded", function() {

  
  let audioCtx = null;
  let isSoundMuted = true; // 初期状態は消音

  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  const soundStatusLabel = document.getElementById("sound-status-label");

  // 音声システムを初期化
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // サウンドON/OFFボタンが押された時
  soundToggleBtn.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    initAudio();

    if (isSoundMuted) {
      isSoundMuted = false;
      soundStatusLabel.textContent = "ON";
      soundToggleBtn.style.backgroundColor = "rgba(0, 240, 255, 0.25)";
      soundToggleBtn.style.color = "#000";
      playSynthSound("success"); // 覚醒音
    } else {
      isSoundMuted = true;
      soundStatusLabel.textContent = "OFF";
      soundToggleBtn.style.backgroundColor = "";
      soundToggleBtn.style.color = "";
    }
  });

  function playSynthSound(type) {
    if (isSoundMuted || !audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } 
      else if (type === "laser") {
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } 
      else if (type === "explosion") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
        
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } 
      else if (type === "charge") {
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(400 + (shieldTaps * 15), now); 
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
      else if (type === "success") {
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
      else if (type === "fail") {
   
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.log("Audio play error", e);
    }
  }



  document.addEventListener("mousedown", function(e) {
    // ボタンやフォーム、ミニゲーム領域を邪魔しないようにする
    if (e.target.closest("button, input, .target, .shield-generator-core")) return;
    createGlobalSpark(e.pageX, e.pageY);
    playSynthSound("click"); 
  });

  // モバイル用のタッチ対応
  document.addEventListener("touchstart", function(e) {
    if (e.target.closest("button, input, .target, .shield-generator-core")) return;
    initAudio(); // 最初のタップでブラウザのAudio制限を解除
    const touch = e.touches[0];
    createGlobalSpark(touch.pageX, touch.pageY);
    playSynthSound("click");
  }, { passive: true });

  function createGlobalSpark(x, y) {
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const p = document.createElement("div");
      p.className = "global-tap-spark";
      p.style.left = x + "px";
      p.style.top = y + "px";

      // 360度にランダム飛散
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 25;
      const gtx = Math.cos(angle) * distance;
      const gty = Math.sin(angle) * distance;

      p.style.setProperty('--gtx', gtx + "px");
      p.style.setProperty('--gty', gty + "px");

      document.body.appendChild(p);
      setTimeout(() => { p.remove(); }, 600);
    }
  }


  // ==========================================
  // 【共通】オープニング演出のスキップ & 自動移行
  // ==========================================
  const skipBtn = document.getElementById("skip-btn");
  const overlay = document.getElementById("opening-crawl-overlay");
  const mainContent = document.getElementById("main-content");

  function showMainPage() {
    initAudio();
    overlay.classList.add("hidden");
    mainContent.classList.remove("hidden");
    window.scrollTo(0, 0);
    
    // スクロール感知フェードインの稼働
    setTimeout(revealOnScroll, 100);
    // ライブ通信ログを起動
    startLiveLogStream();
  }

  const skipTrigger = 'ontouchstart' in window ? 'touchstart' : 'click';
  skipBtn.addEventListener(skipTrigger, function(e) {
    e.preventDefault();
    e.stopPropagation();
    showMainPage();
  }, { passive: false });

  setTimeout(showMainPage, 50000);


  // ==========================================
  // 【追加】軽量スクロールフェードイン（IntersectionObserver）
  // ==========================================
  const revealElements = document.querySelectorAll(".reveal-on-scroll");

  function revealOnScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: "0px 0px -80px 0px",
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  }


  // ==========================================
  // 【共通】予備コンソール：タブ切り替え
  // ==========================================
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    const tabTrigger = 'ontouchstart' in window ? 'touchstart' : 'click';
    btn.addEventListener(tabTrigger, function(e) {
      e.preventDefault();
      playSynthSound("click");
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTabId = btn.getAttribute("data-tab");
      document.getElementById(targetTabId).classList.add("active");

      if (targetTabId === "tab-shooting") {
        resetShootingGame();
      } else if (targetTabId === "tab-shield") {
        resetShieldGame();
      }
    });
  });


  // ==========================================
  // ★ライブコックピット通信ログのスクロール出力システム
  // ==========================================
  const logContainer = document.getElementById("live-log-container");
  
  // 【編集エリア】
  const logDatabase = [
    "マシントラブルにより電圧がわずかに低下中...",
    "警告: 青い生物が教室の隅で寝転がっています。",
    "四天王の1人がトランプのシャッフルを開始。",
    "宿敵が「ライトセーバーって意外と重いな」と呟いています。",
    "エンジンオイルの代わりに文化祭の焼きそばのソースを入れないでください。",
    "前方よりキツナミ星の不思議な引力波を感知。",
    "34HRのクルーたちがクラスの絆の重要性を語り合っています。",
    "四天王A「お腹空いたからクラス展示用の唐揚げ買いに行っていい？」",
    "キツナミ星の住民が物珍しそうにこちらの段ボール装飾を見ています。",
    "コックピット温度24度。エアコンのフォースを少し強めました。",
    "宿敵が「ボスとしての威厳」を鏡の前で練習中...",
    "警告: 受付付近で誰かのスマホの充電が12%に低下した模様。"
  ];

  function addLogEntry(text) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `[${timeStr}] > ${text}`;
    
    logContainer.appendChild(entry);

    // ログが増えすぎたら古いものを消す（表示領域確保のため最大5つ）
    if (logContainer.children.length > 5) {
      logContainer.children[0].remove();
    }
  }

  function startLiveLogStream() {
    // 最初のログ
    addLogEntry("迎撃コックピット通信システム 稼働完了。");
    addLogEntry("キツナミ星に不時着した34HR宇宙船の予備エネルギーを観測中。");

    // 4秒ごとにランダムなライブログを出力し続ける
    setInterval(() => {
      if (mainContent.classList.contains("hidden")) return; // オープニング中は動かさない
      const randomMsg = logDatabase[Math.floor(Math.random() * logDatabase.length)];
      addLogEntry(randomMsg);
    }, 4000);
  }


  // ==========================================
  // ① 暗号解読ミッション
  // ==========================================
  const DECODING_ANSWER = "200"; 

  const decodeInput = document.getElementById("decode-input");
  const decodeSubmitBtn = document.getElementById("decode-submit-btn");
  const decodeResult = document.getElementById("decode-result");

  decodeSubmitBtn.addEventListener("click", function() {
    const userAnswer = decodeInput.value.trim();

    if (userAnswer === "") {
      playSynthSound("fail");
      decodeResult.style.display = "block";
      decodeResult.className = "decode-result-box decode-failed";
      decodeResult.innerHTML = "回答を入力してください。";
      return;
    }

    playSynthSound("click");
    decodeSubmitBtn.disabled = true;
    decodeResult.style.display = "block";
    decodeResult.className = "decode-result-box";
    decodeResult.style.color = "var(--theme-red)";
    decodeResult.style.border = "1px dashed var(--theme-red)";
    decodeResult.style.backgroundColor = "rgba(0, 240, 255, 0.05)";

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      decodeResult.innerHTML = `DECODING DATABASE... ${progress}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
        decodeSubmitBtn.disabled = false;
        
        if (userAnswer === DECODING_ANSWER) {
          playSynthSound("success");
          decodeResult.className = "decode-result-box decode-success";
          decodeResult.style.color = "";
          decodeResult.style.border = "";
          decodeResult.style.backgroundColor = "";
          decodeResult.innerHTML = `
            <p style="font-size: 1.1rem; margin-bottom: 5px; font-family: 'Orbitron', sans-serif; letter-spacing: 2px;">SUCCESS / 正解</p>
            <p style="font-size: 0.9rem; font-weight: normal; text-align: left; line-height: 1.6;">
              ウーキー族の平均寿命は400年ほどと言われているため、200歳を超えていても人間でいう「働き盛りのアラフォー」くらいの感覚らしい。
            </p>
          `;
        } else {
          playSynthSound("fail");
          decodeResult.className = "decode-result-box decode-failed";
          decodeResult.style.color = "";
          decodeResult.style.border = "";
          decodeResult.style.backgroundColor = "";
          decodeResult.innerHTML = "ACCESS DENIED（解読失敗：数値が異なります）";
        }
      }
    }, 250);
  });


  // ==========================================
  // ② デブリ射撃
  // ==========================================
  const SHOOTING_LIMIT_TIME = 15;

  let shootScore = 0;
  let shootTimer = SHOOTING_LIMIT_TIME;
  let shootInterval = null;
  let targetSpawnInterval = null;
  let isGamePlaying = false;

  const shootingField = document.getElementById("shooting-field");
  const startScreen = document.getElementById("shooting-start-screen");
  const shootingStartBtn = document.getElementById("shooting-start-btn");
  const scoreDisplay = document.getElementById("shoot-score");
  const timerDisplay = document.getElementById("shoot-timer");
  const shootingResult = document.getElementById("shooting-result");

  shootingStartBtn.addEventListener("click", startShootingGame);

  function startShootingGame() {
    playSynthSound("success");
    isGamePlaying = true;
    shootScore = 0;
    shootTimer = SHOOTING_LIMIT_TIME;
    scoreDisplay.textContent = shootScore;
    timerDisplay.textContent = shootTimer;

    startScreen.classList.add("hidden");
    shootingResult.classList.remove("show");

    shootInterval = setInterval(function() {
      shootTimer--;
      timerDisplay.textContent = shootTimer;

      if (shootTimer <= 0) {
        endShootingGame();
      }
    }, 1000);

    spawnTarget(); 
    targetSpawnInterval = setInterval(spawnTarget, 650);
  }

  function spawnTarget() {
    if (!isGamePlaying) return;

    const activeTargets = shootingField.querySelectorAll(".target");
    if (activeTargets.length >= 4) { 
      activeTargets[0].remove();
    }

    const target = document.createElement("div");
    target.className = "target";

    const crystal = document.createElement("div");
    crystal.className = "target-crystal-inner";
    target.appendChild(crystal);

    const fieldWidth = shootingField.clientWidth;
    const fieldHeight = shootingField.clientHeight;
    const targetSize = 44; 

    const randomX = Math.floor(Math.random() * (fieldWidth - targetSize));
    const randomY = Math.floor(Math.random() * (fieldHeight - targetSize));

    target.style.left = randomX + "px";
    target.style.top = randomY + "px";

    const triggerEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
    target.addEventListener(triggerEvent, function(e) {
      e.stopPropagation(); 
      if (!isGamePlaying) return;
      shootScore++;
      scoreDisplay.textContent = shootScore;

      // 効果音を再生（デブリ迎撃の音）
      playSynthSound("laser");
      setTimeout(() => { playSynthSound("explosion"); }, 50);

      createLaserBurst(randomX + 22, randomY + 22);
      createCrystalParticles(randomX + 22, randomY + 22);
      
      target.remove(); 
    });

    shootingField.appendChild(target);
  }

  function createLaserBurst(x, y) {
    const ring = document.createElement("div");
    ring.className = "laser-ring";
    ring.style.left = (x - 22) + "px";
    ring.style.top = (y - 22) + "px";
    shootingField.appendChild(ring);
    
    setTimeout(() => {
      ring.remove();
    }, 400);
  }

  function createCrystalParticles(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const spark = document.createElement("div");
      spark.className = "debris-spark";
      spark.style.left = x + "px";
      spark.style.top = y + "px";

      const angle = (i * (360 / particleCount)) * (Math.PI / 180);
      const distance = 40 + Math.random() * 30; 
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      spark.style.setProperty('--tx', tx + "px");
      spark.style.setProperty('--ty', ty + "px");

      shootingField.appendChild(spark);

      setTimeout(() => {
        spark.remove();
      }, 500);
    }
  }

  function endShootingGame() {
    playSynthSound("success");
    isGamePlaying = false;
    clearInterval(shootInterval);
    clearInterval(targetSpawnInterval);

    const activeTargets = shootingField.querySelectorAll(".target");
    activeTargets.forEach(t => t.remove());

    startScreen.classList.remove("hidden");

    let rankTitle = "";
    let rankDesc = "";
    let scorePercent = Math.min((shootScore / 20) * 100, 100); 

    if (shootScore <= 6) {
      rankTitle = "不時着ビギナー";
      rankDesc = "デブリの迎撃精度が足りていません。キツナミ星の野生動物に囲まれたらひとたまりもないでしょう。34HRの仲間を盾にして生き延びよう。";
    } else if (shootScore <= 14) {
      rankTitle = "34HRエース操縦士";
      rankDesc = "確実な射撃精度と十分な動体視力。キツナミ星を囲む危険な小惑星デブリ帯を悠々と潜り抜けられる優秀な操縦技術です。";
    } else {
      rankTitle = "フォースマスター級戦士";
      rankDesc = "神がかった反射速度。飛来するデブリをすべてエネルギーに変換するほどの超感覚。宿敵を打倒し銀河に調和を取り戻せるのは君だ。";
    }

    shootingResult.innerHTML = `
      <span class="decor-corner top-left"></span><span class="decor-corner top-right"></span>
      <span class="decor-corner bottom-left"></span><span class="decor-corner bottom-right"></span>

      <div class="shoot-result-header">島田高校34HR 迎撃評価報告書</div>
      
      <div class="shoot-grid-stats">
        <div class="shoot-stat-box">
          <div class="shoot-stat-label">DEBRIS DESTROYED</div>
          <div class="shoot-stat-value" style="color: var(--theme-red); text-shadow: 0 0 8px var(--glow-red);">${shootScore} 基</div>
        </div>
        <div class="shoot-stat-box">
          <div class="shoot-stat-label">ACCURACY RATE</div>
          <div class="shoot-stat-value">${Math.min(shootScore * 6, 100)}%</div>
        </div>
      </div>

      <p style="font-size: 0.8rem; color: var(--text-gray); margin-bottom: 5px; font-family: 'Orbitron', sans-serif;">INTERCEPTOR POWER GAUGE</p>
      <div class="shoot-meter-wrap">
        <div id="shoot-meter-fill" class="shoot-meter-fill"></div>
      </div>

      <div class="result-rank-title" style="margin-top: 15px;">ランク：${rankTitle}</div>
      <p style="font-size: 0.85rem; color: #ccc; margin-top: 10px; text-align: left; line-height: 1.6;">${rankDesc}</p>
    `;

    shootingResult.classList.add("show");

    setTimeout(() => {
      const fillBar = document.getElementById("shoot-meter-fill");
      if (fillBar) {
        fillBar.style.width = scorePercent + "%";
      }
    }, 100);
  }

  function resetShootingGame() {
    isGamePlaying = false;
    clearInterval(shootInterval);
    clearInterval(targetSpawnInterval);
    const activeTargets = shootingField.querySelectorAll(".target");
    activeTargets.forEach(t => t.remove());
    startScreen.classList.remove("hidden");
    shootingResult.classList.remove("show");
    scoreDisplay.textContent = "0";
    timerDisplay.textContent = SHOOTING_LIMIT_TIME;
  }


  // ==========================================
  // ③ 34HRクルー適性診断（5問・4択）
  // ==========================================
  const diagQuestions = [
    {
      q: "問1: 宇宙船がキツナミ星の砂漠エリアに不時着した。あなたが最初に行う行動は？",
      options: [
        { text: "「ライトセーバー等の武器」の確認。いつでも応戦できるようにする", type: "A" },
        { text: "「機関室のログ」を解析。エンジンの故障箇所をシステム的に特定する", type: "B" },
        { text: "「仲間の体調」を確認。不時着の衝撃による負傷者がいないか調べる", type: "C" },
        { text: "「外部センサー」を起動。周辺に敵影がないか、安全な地形を速やかにマッピングする", type: "D" }
      ]
    },
    {
      q: "問2: 迫りくる「謎の四天王」のひとりが不気味な笑みを浮かべて現れた。あなたならどう対処する？",
      options: [
        { text: "ライトセーバーを抜き、34HRの誇りを胸に真っ向勝負を仕掛ける！", type: "A" },
        { text: "四天王の装備や歩調を冷静にスキャンし、論理的な弱点を割り出して攻撃を仕組む", type: "B" },
        { text: "四天王の背後のフォースの乱れを感じ取り、彼を暗黒面から説得する道を模索する", type: "C" },
        { text: "文化祭のチラシとお土産を差し出し、絶妙なトークで攪乱して戦闘自体を回避する", type: "D" }
      ]
    },
    {
      q: "問3: キツナミ星の住民と「予備のエンジン部品」の物々交換が必要だ。あなたの担当は？",
      options: [
        { text: "交渉が失敗した際のボディガード役。力強い気迫で相手の安易な裏切りを防ぐ", type: "A" },
        { text: "交換対象の部品を厳密に鑑定。品質や適正価値が合致しているか論理計算する", type: "B" },
        { text: "相手の言語やトーンから心の障壁を読み取り、友好的かつ誠実な態度で合意を促す", type: "C" },
        { text: "前面に立って笑顔と愛嬌でアピール！言葉の壁を破壊する熱意とノリで契約を成立させる", type: "D" }
      ]
    },
    {
      q: "問4: 船のパワーセル（電池）が切れかかっている。どうやって充電する？",
      options: [
        { text: "持ち前の筋肉と気合を信じ、船の手動充電クランクを限界まで回し続ける", type: "A" },
        { text: "不必要なサブシステムから配線を分岐（バイパス）させ、回路的なハッキングで復旧させる", type: "B" },
        { text: "キツナミパワー結晶に両手をかざし、フォースの共鳴による奇跡のエネルギー充電を試みる", type: "C" },
        { text: "「充電できそうなキツナミ野生生物」を探しに行き、持ち前の愛嬌でなだめて電気を分けてもらう", type: "D" }
      ]
    },
    {
      q: "問5: キツナミ星から飛び立つ瞬間、恐るべき宿敵（青い生物の支配者）が背後から母船を狙撃しようとしている！",
      options: [
        { text: "船外の迎撃タレットに飛び乗り、放たれたレーザーを撃ち落として船を守り抜く！", type: "A" },
        { text: "敵の放つレーザーの軌道を逆計算し、推進ノズルを極限まで傾け「重力シールド回避」を実行する", type: "B" },
        { text: "仲間の手をしっかりと握り、クラスの絆による究極の「共鳴フォースバリア」を展開する", type: "C" },
        { text: "宇宙船に搭載された特殊デコイ（身代わりバルーン）を射出し、敵の照準器を100%欺く", type: "D" }
      ]
    }
  ];

  const diagResults = {
    A: {
      name: "ライトセーバー剣士 (Saber Duelist)",
      desc: "あなたは恐怖に恐れず道を切り拓く『剣士』タイプです！高い攻撃力とクラスの絆を大切にし、宿敵や四天王が現れても先陣を切って防衛にあたる頼もしい守護者です。熱くなりすぎてエンジン破損を見落とさないように注意！"
    },
    B: {
      name: "宇宙船エンジニア (Chief Engineer)",
      desc: "あなたは冷静に状況を見極める『エンジニア』タイプです！不時着時もパニックに陥らず、論理的な診断プロセスでマシントラブルを解決する34HRのブレイン。君がいなければ船はキツナミ星から一歩も飛び立てません。"
    },
    C: {
      name: "フォース調律師 (Force Balancer)",
      desc: "あなたは協調性と広い視野をあわせ持つ『フォース使い』タイプです！キツナミ星の住民や青い生物たちの様子を細かく観察し、最適な状況を導きます。メンバーのポテンシャルを何倍にも高める、クラスの調和の要です。"
    },
    D: {
      name: "銀河のトリックスター (Galactic Trickster)",
      desc: "あなたは無限の機転と愛嬌で奇跡を起こす『交渉・隠密』タイプです！言葉の壁や強大な力に対し、真っ向勝負ではなく「ユーモア」と「裏口交渉」で勝利するトリックスター。キツナミ星の住民を手玉に取り、クラスの危機をお笑いに変えてしまう天性の素質があります！"
    }
  };

  let currentDiagIndex = 0;
  let diagScore = { A: 0, B: 0, C: 0, D: 0 };

  const diagQTitle = document.getElementById("diag-q-title");
  const diagQText = document.getElementById("diag-q-text");
  const diagOptionsContainer = document.getElementById("diag-options-container");
  const diagResultBox = document.getElementById("diag-result-box");
  const diagQuestionBox = document.getElementById("diag-question-box");
  const diagProgressBar = document.getElementById("diag-progress-bar");

  showDiagQuestion();

  function showDiagQuestion() {
    const progressPercent = (currentDiagIndex / diagQuestions.length) * 100;
    diagProgressBar.style.width = progressPercent + "%";

    const currentQ = diagQuestions[currentDiagIndex];
    diagQTitle.textContent = `質問 ${currentDiagIndex + 1} / ${diagQuestions.length}`;
    diagQText.textContent = currentQ.q;

    diagOptionsContainer.innerHTML = "";
    const optionLabels = ["A", "B", "C", "D"];

    currentQ.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.className = "diag-opt-btn";
      
      const badge = document.createElement("span");
      badge.className = "diag-opt-badge";
      badge.textContent = optionLabels[index];
      
      const textSpan = document.createElement("span");
      textSpan.className = "diag-opt-text";
      textSpan.textContent = opt.text;
      
      btn.appendChild(badge);
      btn.appendChild(textSpan);

      const triggerEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
      btn.addEventListener(triggerEvent, function(e) {
        e.preventDefault();
        playSynthSound("click");
        
        btn.classList.add("selected-flash");
        
        setTimeout(() => {
          diagScore[opt.type]++;
          currentDiagIndex++;
          
          if (currentDiagIndex < diagQuestions.length) {
            showDiagQuestion();
          } else {
            showDiagResult();
          }
        }, 300);
      });
      
      diagOptionsContainer.appendChild(btn);
    });
  }

  function showDiagResult() {
    playSynthSound("success");
    diagProgressBar.style.width = "100%";
    diagQuestionBox.classList.add("hidden");

    let finalType = "A";
    let maxScore = -1;

    for (let key in diagScore) {
      if (diagScore[key] > maxScore) {
        maxScore = diagScore[key];
        finalType = key;
      }
    }

    const result = diagResults[finalType];

    diagResultBox.innerHTML = `
      <h4>適性診断結果</h4>
      <p style="font-size: 0.85rem; color: var(--text-gray); margin-bottom: 5px;">あなたの船内クラス役職は...</p>
      <div class="result-rank-title" style="margin-bottom: 15px;">${result.name}</div>
      <p style="font-size: 0.9rem; text-align: left; line-height: 1.7; color: #fff;">${result.desc}</p>
      <button id="diag-retry-btn" class="glow-button red-bg" style="margin-top: 20px;">再度診断を行う (RETRY)</button>
    `;
    diagResultBox.classList.add("show");

    document.getElementById("diag-retry-btn").addEventListener("click", function() {
      playSynthSound("click");
      currentDiagIndex = 0;
      diagScore = { A: 0, B: 0, C: 0, D: 0 };
      diagResultBox.classList.remove("show");
      diagQuestionBox.classList.remove("hidden");
      showDiagQuestion();
    });
  }


  // ==========================================
  // ④ シールド復旧ゲーム
  // ==========================================
  const TAP_GOAL = 40; 
  const SHIELD_GAME_LIMIT = 10; 

  let shieldTaps = 0;
  let shieldTimer = SHIELD_GAME_LIMIT;
  let isShieldPlaying = false;
  let shieldInterval = null;

  const shieldFillBar = document.getElementById("shield-fill-bar");
  const shieldTapTarget = document.getElementById("shield-tap-target");
  const shieldStartBtn = document.getElementById("shield-start-btn");
  const shieldTimerDisplay = document.getElementById("shield-timer");
  const shieldPercentText = document.getElementById("shield-percent-text");
  const shieldResult = document.getElementById("shield-result");

  shieldStartBtn.addEventListener("click", startShieldGame);

  const tapEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
  shieldTapTarget.addEventListener(tapEvent, function(e) {
    e.preventDefault();
    if (!isShieldPlaying) return;

    shieldTaps++;
    playSynthSound("charge"); // チャージの独特な周波数上昇音
    createFloatingEnergyEffect();
    
    const glowScale = Math.min((shieldTaps / TAP_GOAL), 1);
    shieldTapTarget.style.boxShadow = `0 0 ${15 + (glowScale * 35)}px rgba(189, 0, 255, ${0.6 + (glowScale * 0.4)})`;
    shieldTapTarget.style.borderColor = `rgb(${Math.floor(glowScale * 255)}, ${Math.floor((1 - glowScale) * 240)}, 255)`;

    const percent = Math.min(Math.round((shieldTaps / TAP_GOAL) * 100), 100);
    shieldPercentText.textContent = percent;
    shieldFillBar.style.height = percent + "%";

    if (percent >= 100) {
      endShieldGame(true);
    }
  });

  function createFloatingEnergyEffect() {
    const floatEl = document.createElement("div");
    floatEl.className = "energy-float";
    
    const randomTexts = ["⚡", "+1%", "CHARGING", "POWER", "⚡⚡"];
    floatEl.textContent = randomTexts[Math.floor(Math.random() * randomTexts.length)];

    const startX = -30 + Math.random() * 60;
    const startY = -30 + Math.random() * 60;
    const endX = startX + (-40 + Math.random() * 80);
    const endY = startY - (70 + Math.random() * 50);

    floatEl.style.setProperty('--startX', startX + "px");
    floatEl.style.setProperty('--startY', startY + "px");
    floatEl.style.setProperty('--endX', endX + "px");
    floatEl.style.setProperty('--endY', endY + "px");

    shieldTapTarget.appendChild(floatEl);

    setTimeout(() => {
      floatEl.remove();
    }, 600);
  }

  function startShieldGame() {
    playSynthSound("success");
    isShieldPlaying = true;
    shieldTaps = 0;
    shieldTimer = SHIELD_GAME_LIMIT;
    shieldPercentText.textContent = "0";
    shieldTimerDisplay.textContent = shieldTimer.toFixed(1);
    shieldFillBar.style.height = "0%";

    shieldStartBtn.disabled = true;
    shieldResult.classList.remove("show");

    shieldInterval = setInterval(function() {
      shieldTimer -= 0.1;
      if (shieldTimer <= 0) {
        shieldTimer = 0;
        endShieldGame(false);
      }
      shieldTimerDisplay.textContent = shieldTimer.toFixed(1);
    }, 100);
  }

  function endShieldGame(isSuccess) {
    isShieldPlaying = false;
    clearInterval(shieldInterval);
    shieldStartBtn.disabled = false;

    shieldTapTarget.style.boxShadow = "";
    shieldTapTarget.style.borderColor = "";

    let title = "";
    let desc = "";
    const percent = Math.min(Math.round((shieldTaps / TAP_GOAL) * 100), 100);

    if (isSuccess) {
      playSynthSound("success");
      title = "ハイパードライブ起動可能 (HYPERDRIVE ON)";
      desc = "素晴らしい連打力！宇宙船の防御シールドが100%まで急速復旧し、マシントラブルのコアをバイパスしました。これで宿敵や四天王が襲来しても防御は完璧です。さぁ、エンジンを始動して34HRの軌道を修正しましょう！";
      
      document.body.classList.add("shake-effect");
      setTimeout(() => {
        document.body.classList.remove("shake-effect");
      }, 1000);

    } else {
      playSynthSound("fail");
      title = "電圧不足・シールドダウン (CHARGING FAILED)";
      desc = `時間切れです。シールドの復旧率は「${percent}%」に留まりました。キツナミ星の不思議な結晶エネルギー波に押し負けています。もっと指先を素早く、フォースを集約してもう一度トライしてください！`;
    }

    shieldResult.innerHTML = `
      <h4 style="color: ${isSuccess ? 'var(--theme-green)' : 'var(--theme-warning)'};">
        ${isSuccess ? '充電完了！' : 'システム停止'}
      </h4>
      <div class="result-rank-title" style="color: ${isSuccess ? 'var(--theme-green)' : 'var(--theme-warning)'}; font-size: 1.2rem; margin-bottom: 10px;">
        ${title}
      </div>
      <p style="font-size: 0.85rem; color: #ccc; text-align: left; line-height: 1.6;">${desc}</p>
    `;
    shieldResult.classList.add("show");
  }

  function resetShieldGame() {
    isShieldPlaying = false;
    clearInterval(shieldInterval);
    shieldTaps = 0;
    shieldTimer = SHIELD_GAME_LIMIT;
    shieldTimerDisplay.textContent = shieldTimer.toFixed(1);
    shieldPercentText.textContent = "0";
    shieldFillBar.style.height = "0%";
    shieldStartBtn.disabled = false;
    shieldResult.classList.remove("show");
    
    shieldTapTarget.style.boxShadow = "";
    shieldTapTarget.style.borderColor = "";
  }


  // ==========================================
  // ★【追加】キツナミ星・フォース運勢おみくじ
  // ==========================================
  // 【編集エリア】
  const fortuneDatabase = [
    {
      luck: "大吉 (HIGH FORCE)",
      desc: "あなたの全身から強力なフォースが湧き上がっています。今日は34HRの脱出ゲームを体験すると、一発で謎が解き明かせることでしょう。待機列での待ち時間が一瞬に感じられる強力な幸運日です。",
      item: "ラッキーアイテム: 34HRの段ボールの端切れ"
    },
    {
      luck: "吉 (STABLE FORCE)",
      desc: "比較的フォースが調和しています。キツナミ星の住民とも友好的に会話でき、宿敵との戦いでも四天王を裏口からスルーする程度の運命を持ち合わせています。安心してください。",
      item: "ラッキーアイテム: クラスメイトが配っているビラ"
    },
    {
      luck: "凶 (LIGHT DISTORTION)",
      desc: "フォースがやや不安定です。宇宙船のマシントラブルが多発し、ライトセーバーのカイバークリスタルにヒビが入る恐れがあります。今すぐ34HRへ入室し、仲間とフォースを共鳴させて厄落としをしてください。",
      item: "ラッキーアイテム: 階段を上がった先の赤い警告灯"
    },
    {
      luck: "宿敵の気配 (DARK OVERLOAD)",
      desc: "驚異の特異点！フォースの暗黒面が異常値を示しています。ボス（宿敵）や青い生物に背後から狙われている可能性があります。しかし、逆に「圧倒的な悪運」としてあらゆる謎を気合だけで突破できるかもしれません。",
      item: "ラッキーアイテム: スマホの十分なバッテリー残量"
    }
  ];

  const fortuneScanBtn = document.getElementById("fortune-scan-btn");
  const fortuneLoader = document.getElementById("fortune-loader");
  const fortuneDisplayResult = document.getElementById("fortune-display-result");

  fortuneScanBtn.addEventListener("click", function(e) {
    e.preventDefault();
    initAudio();
    playSynthSound("click");

    // スキャン開始
    fortuneScanBtn.disabled = true;
    fortuneDisplayResult.classList.add("hidden");
    fortuneLoader.classList.remove("hidden");

    // 計器スキャン音（高周波パルス音のループシミュレーション）
    let soundTicks = 0;
    const soundInterval = setInterval(() => {
      playSynthSound("click");
      soundTicks++;
      if (soundTicks >= 6) clearInterval(soundInterval);
    }, 200);

    setTimeout(() => {
      // スキャン終了
      fortuneLoader.classList.add("hidden");
      fortuneDisplayResult.classList.remove("hidden");
      fortuneScanBtn.disabled = false;

      playSynthSound("success");

      // ランダム抽選
      const randomFortune = fortuneDatabase[Math.floor(Math.random() * fortuneDatabase.length)];

      fortuneDisplayResult.innerHTML = `
        <div class="fortune-out">
          <div class="luck-level">${randomFortune.luck}</div>
          <p class="luck-desc">${randomFortune.desc}</p>
          <div class="luck-item">${randomFortune.item}</div>
        </div>
      `;
    }, 1500); // 1.5秒のスキャン演出
  });

});
